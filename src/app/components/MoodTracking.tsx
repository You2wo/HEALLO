"use client";

import React, { useState, useEffect } from "react";

interface MoodTrackingProps {
  month?: string;
}

type MoodType = 'good' | 'neutral' | 'bad' | 'stress' | 'meh' | 'untracked';

interface MoodDay {
  mood: MoodType;
  date: string; // Format: YYYY-MM-DD
  dayNumber: number;
}

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const getStorageKey = (year: number, month: number): string => {
  return `mood-tracker-${year}-${month}`;
};

// Calculate total completed days (days with mood entries)
export const calculateStreak = (): number => {
  let completedDays = 0;
  
  // Get all keys from localStorage that match our mood tracker pattern
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    
    // Check if this is a mood tracker key (format: mood-tracker-YYYY-M)
    if (key && key.startsWith('mood-tracker-')) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const moodData = JSON.parse(stored);
          
          // Count all days with tracked moods (not untracked)
          Object.values(moodData).forEach((mood) => {
            if (mood && mood !== 'untracked') {
              completedDays++;
            }
          });
        }
      } catch (e) {
        // Skip invalid data
        console.error('Error parsing mood data:', e);
      }
    }
  }
  
  return completedDays;
};

const MoodCircle: React.FC<{ 
  mood: MoodType; 
  dayNumber: number;
  isToday: boolean;
  isFuture: boolean;
  onClick: () => void;
}> = ({ mood, dayNumber, isToday, isFuture, onClick }) => {
  const getCircleStyles = () => {
    const baseStyles = 'flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full transition-all duration-200';
    
    if (isFuture) {
      return `${baseStyles} bg-gray-300 cursor-not-allowed opacity-50`;
    }
    
    const hoverStyles = 'cursor-pointer hover:scale-110 hover:shadow-md';
    
    switch (mood) {
      case 'good':
        return `${baseStyles} ${hoverStyles} bg-yellow-400 hover:bg-yellow-500`;
      case 'neutral':
        return `${baseStyles} ${hoverStyles} bg-blue-500 hover:bg-blue-600`;
      case 'bad':
        return `${baseStyles} ${hoverStyles} bg-red-500 hover:bg-red-600`;
      case 'stress':
        return `${baseStyles} ${hoverStyles} bg-orange-500 hover:bg-orange-600`;
      case 'meh':
        return `${baseStyles} ${hoverStyles} bg-cyan-300 hover:bg-cyan-400`;
      default:
        return `${baseStyles} ${hoverStyles} bg-gray-300 hover:bg-gray-400`;
    }
  };

  const getCheckmark = () => {
    if (mood === 'good' || mood === 'neutral' || mood === 'bad' || mood === 'stress' || mood === 'meh') {
      return (
        <svg className="w-3 h-3 md:w-4 md:h-4" fill="white" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    return null;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the schedule click
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={isFuture}
      className={`${getCircleStyles()} ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
      title={isFuture ? 'Future date' : `Day ${dayNumber} - Click to change mood`}
      aria-label={`Day ${dayNumber}, mood: ${mood}`}
    >
      {getCheckmark()}
    </button>
  );
};

const MoodSelector: React.FC<{
  onSelect: (mood: MoodType) => void;
  onClose: () => void;
  selectedDate: Date;
}> = ({ onSelect, onClose, selectedDate }) => {
  const [notes, setNotes] = useState('');
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayName = dayNames[selectedDate.getDay()];
  const monthName = monthNames[selectedDate.getMonth()];
  const dayNumber = selectedDate.getDate();
  
  const handleSave = (mood: MoodType) => {
    onSelect(mood);
    // Here you could also save the notes if needed
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] overflow-auto" onClick={(e) => e.stopPropagation()}>
      <div className="min-h-screen w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex flex-col md:flex-row h-screen">
          {/* Left side - Mascot and Date */}
          <div className="bg-gradient-to-b from-white to-[#A7D8F4] p-4 md:p-8 h-1/2 md:h-full md:w-1/2 flex flex-col items-center justify-start pt-8 md:pt-16 relative md:rounded-[128px] overflow-hidden">
            <div className="flex items-center justify-center gap-4 md:gap-8 mb-4 md:mb-8 w-full px-4 md:px-8">
              {/* Left side - Day and Month */}
              <div className="text-left">
                <div className="text-gray-500 text-2xl md:text-4xl font-light leading-tight">{dayName},</div>
                <div className="text-gray-800 text-4xl md:text-4xl font-semibold leading-tight">{monthName}</div>
              </div>
              
              {/* Right side - Date Number */}
              <div className="text-gray-800 text-[80px] md:text-[140px] font-bold leading-none">
                {dayNumber}
                <sup className="text-3xl md:text-5xl font-bold align-super">
                  {dayNumber === 1 || dayNumber === 21 || dayNumber === 31 ? 'st' : 
                   dayNumber === 2 || dayNumber === 22 ? 'nd' : 
                   dayNumber === 3 || dayNumber === 23 ? 'rd' : 'th'}
                </sup>
              </div>
            </div>
            
            {/* Mascot Image - positioned at bottom spanning to middle */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 flex items-end justify-center">
              <img 
                src="/Mask group.svg" 
                alt="Mascot" 
                className="w-auto h-full object-contain object-bottom"
              />
              
              {/* Speech Bubble attached to mascot */}
              <div className="absolute top-[-100px] md:top-[-200px] left-1/2 transform -translate-x-1/2 z-20">
                <div className="relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-2xl max-w-xs md:max-w-2xl w-[280px] md:w-[500px]">
                  <p className="text-sm md:text-2xl text-gray-600 text-center leading-relaxed font-medium">
                    Believe you can and<br />you&apos;re halfway there!
                  </p>
                  {/* Speech bubble tail/spike pointing down */}
                  <div className="absolute -bottom-4 md:-bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-[20px] md:border-l-[40px] border-l-transparent border-r-[20px] md:border-r-[40px] border-r-transparent border-t-[20px] md:border-t-[40px] border-t-white filter drop-shadow-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Mood Selection */}
          <div className="p-8 md:w-1/2 bg-gray-50">
            {/* Navigation tabs */}
            <div className="flex items-center gap-6 mb-8 md:mb-10">
              <button className="text-gray-600 hover:text-gray-800 transition-colors" aria-label="Settings">
                <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button className="text-gray-900 hover:text-gray-700 transition-colors text-lg md:text-xl font-medium">
                Home
              </button>
              <button className="text-blue-600 hover:text-blue-700 transition-colors text-lg md:text-xl font-semibold">
                Journal
              </button>
              <button className="text-gray-900 hover:text-gray-700 transition-colors text-lg md:text-xl font-medium">
                About
              </button>
            </div>
            
            {/* Mood Selection */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6">How are you feeling today?</h3>
              <div className="flex gap-2 md:gap-4 justify-start flex-wrap">
                <button
                  onClick={() => handleSave('good')}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-t-3xl bg-white border-2 border-blue-400 hover:border-blue-500 transition-all group shadow-sm hover:shadow-md"
                  title="Happy"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img src="/Emoji2.svg" alt="Happy" className="w-11 h-11 md:w-16 md:h-16" />
                  </div>
                  <span className="text-sm md:text-lg font-semibold text-gray-900">Happy</span>
                </button>
                
                <button
                  onClick={() => handleSave('neutral')}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-t-3xl bg-white border-2 border-gray-200 hover:border-gray-300 transition-all group shadow-sm hover:shadow-md"
                  title="Sad"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img src="/Emoji1.svg" alt="Sad" className="w-11 h-11 md:w-16 md:h-16" />
                  </div>
                  <span className="text-sm md:text-lg font-semibold text-gray-900">Sad</span>
                </button>
                
                <button
                  onClick={() => handleSave('bad')}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-t-3xl bg-white border-2 border-gray-200 hover:border-gray-300 transition-all group shadow-sm hover:shadow-md"
                  title="Mad"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img src="/Emoji3.svg" alt="Mad" className="w-11 h-11 md:w-16 md:h-16" />
                  </div>
                  <span className="text-sm md:text-lg font-semibold text-gray-900">Mad</span>
                </button>
                
                <button
                  onClick={() => handleSave('stress')}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-t-3xl bg-white border-2 border-gray-200 hover:border-gray-300 transition-all group shadow-sm hover:shadow-md"
                  title="Stress"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img src="/Emoji5.svg" alt="Stress" className="w-11 h-11 md:w-16 md:h-16" />
                  </div>
                  <span className="text-sm md:text-lg font-semibold text-gray-900">Stress</span>
                </button>
                
                <button
                  onClick={() => handleSave('meh')}
                  className="flex flex-col items-center gap-2 md:gap-3 p-3 md:p-6 rounded-t-3xl bg-white border-2 border-gray-200 hover:border-gray-300 transition-all group shadow-sm hover:shadow-md"
                  title="Meh"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img src="/Emoji4.svg" alt="Meh" className="w-11 h-11 md:w-16 md:h-16" />
                  </div>
                  <span className="text-sm md:text-lg font-semibold text-gray-900">Meh</span>
                </button>
              </div>
            </div>
            
            {/* Notes Section */}
            <div className="mb-6">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 md:mb-6">How was your day?</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={(e) => {
                  // Prevent event propagation to allow space key to work
                  e.stopPropagation();
                }}
                placeholder="tell us about your day ..."
                className="w-full h-48 md:h-56 p-4 md:p-6 border-2 border-blue-400 rounded-3xl resize-none focus:outline-none focus:border-blue-500 transition-colors text-gray-400 placeholder:text-gray-400 text-base md:text-lg"
              />
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-8 md:px-12 py-3 md:py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg shadow-lg"
              >
                Save Journal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MoodTracking: React.FC<MoodTrackingProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [moodData, setMoodData] = useState<Record<string, MoodType>>({});
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showSelector, setShowSelector] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
  const todayDate = today.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load mood data from localStorage
  useEffect(() => {
    const storageKey = getStorageKey(currentYear, currentMonth);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setMoodData(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse mood data:', e);
      }
    }
  }, [currentYear, currentMonth]);

  // Save mood data to localStorage
  const saveMoodData = (data: Record<string, MoodType>) => {
    const storageKey = getStorageKey(currentYear, currentMonth);
    localStorage.setItem(storageKey, JSON.stringify(data));
    setMoodData(data);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('moodUpdated'));
  };

  const handleDayClick = (dayNumber: number) => {
    const clickedDate = new Date(currentYear, currentMonth, dayNumber);
    
    // Don't allow selecting future dates
    if (clickedDate > today) {
      return;
    }
    
    setSelectedDay(dayNumber);
    setShowSelector(true);
  };

  const handleMoodSelect = (mood: MoodType) => {
    if (selectedDay === null) return;
    
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const newMoodData = { ...moodData, [dateKey]: mood };
    saveMoodData(newMoodData);
    setShowSelector(false);
    setSelectedDay(null);
  };

  
  // Generate days array
  const days: MoodDay[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      mood: moodData[dateKey] || 'untracked',
      date: dateKey,
      dayNumber: i
    });
  }

  // Split days into rows of 8
  const rows: MoodDay[][] = [];
  for (let i = 0; i < days.length; i += 8) {
    rows.push(days.slice(i, i + 8));
  }

  
  const handleScheduleClick = () => {
    // Open modal for today's date
    const dayToSelect = isCurrentMonth ? todayDate : 1;
    setSelectedDay(dayToSelect);
    setShowSelector(true);
  };

  return (
    <section
      className="bg-gradient-to-br from-white to-blue-100 rounded-3xl shadow-lg p-6 md:p-8 max-w-[430px] cursor-pointer hover:shadow-xl transition-shadow"
      aria-label={`Mood tracking for ${monthNames[currentMonth]} ${currentYear}`}
      onClick={handleScheduleClick}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm md:text-base font-normal text-gray-500 mb-1">Mood Tracking</h3>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          {monthNames[currentMonth]}
        </h2>
      </div>
      
      {/* Horizontal divider */}
      <div className="h-px bg-gray-300 mb-6" />
      
      {/* Mood Calendar Grid */}
      <div className="space-y-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-start gap-3 md:gap-4">
            {row.map((day) => {
              const dayDate = new Date(currentYear, currentMonth, day.dayNumber);
              const isFuture = dayDate > today;
              const isToday = isCurrentMonth && day.dayNumber === todayDate;
              
              return (
                <MoodCircle
                  key={day.date}
                  mood={day.mood}
                  dayNumber={day.dayNumber}
                  isToday={isToday}
                  isFuture={isFuture}
                  onClick={() => handleDayClick(day.dayNumber)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Mood Selector Modal */}
      {showSelector && selectedDay !== null && (
        <MoodSelector
          onSelect={handleMoodSelect}
          onClose={() => {
            setShowSelector(false);
            setSelectedDay(null);
          }}
          selectedDate={new Date(currentYear, currentMonth, selectedDay)}
        />
      )}
    </section>
  );
};
