"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { journalApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface JournalEntry {
  id: string;
  date: string;
  mood: 'good' | 'neutral' | 'bad' | 'stress' | 'meh';
  notes: string;
  dayNumber: number;
  dayName: string;
  monthName: string;
}

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const ViewJournal: React.FC = () => {
  const [currentDate] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const today = new Date();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Redirect to splash if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/splash');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load journal data from backend
  useEffect(() => {
    if (isAuthenticated) {
      loadJournals();
    } else {
      setLoading(false);
    }
  }, [currentYear, currentMonth, isAuthenticated]);

  const loadJournals = async () => {
    try {
      setLoading(true);
      const response = await journalApi.getAll({
        month: currentMonth + 1,
        year: currentYear
      });
      setJournals(response.journals);
      
      // Auto-select first entry
      if (response.journals.length > 0 && !selectedEntry) {
        const firstJournal = response.journals[0];
        const date = new Date(firstJournal.date);
        setSelectedEntry({
          id: firstJournal.id,
          date: firstJournal.date,
          mood: firstJournal.mood,
          notes: firstJournal.notes || "No notes for this day.",
          dayNumber: date.getDate(),
          dayName: dayNames[date.getDay()],
          monthName: monthNames[date.getMonth()]
        });
      }
    } catch (error) {
      console.error('Failed to load journals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmojiSrc = (mood: string) => {
    switch (mood) {
      case 'good':
        return '/Emoji2.svg';
      case 'neutral':
        return '/Emoji1.svg';
      case 'bad':
        return '/Emoji3.svg';
      case 'stress':
        return '/Emoji5.svg';
      case 'meh':
        return '/Emoji4.svg';
      default:
        return '';
    }
  };

  const handleDayClick = (dayNumber: number) => {
    // Find journal entry for this day
    const journal = journals.find(j => {
      const date = new Date(j.date);
      return date.getDate() === dayNumber;
    });
    
    if (journal) {
      const date = new Date(journal.date);
      setSelectedEntry({
        id: journal.id,
        date: journal.date,
        mood: journal.mood,
        notes: journal.notes || "No notes for this day.",
        dayNumber: dayNumber,
        dayName: dayNames[date.getDay()],
        monthName: monthNames[date.getMonth()]
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedEntry) return;
    
    const newNotes = prompt("Edit your journal notes:", selectedEntry.notes);
    if (newNotes !== null) {
      try {
        await journalApi.update(selectedEntry.id, { notes: newNotes });
        setSelectedEntry({ ...selectedEntry, notes: newNotes });
        await loadJournals();
      } catch (error) {
        console.error('Failed to update journal:', error);
        alert('Failed to update journal. Please try again.');
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;
    
    if (confirm("Are you sure you want to delete this journal entry?")) {
      try {
        await journalApi.delete(selectedEntry.id);
        setSelectedEntry(null);
        await loadJournals();
      } catch (error) {
        console.error('Failed to delete journal:', error);
        alert('Failed to delete journal. Please try again.');
      }
    }
  };

  // Generate calendar grid
  const renderCalendar = () => {
    const rows: number[][] = [];
    for (let i = 1; i <= daysInMonth; i += 7) {
      rows.push(Array.from({ length: 7 }, (_, idx) => i + idx).filter(day => day <= daysInMonth));
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="flex justify-start gap-3 md:gap-4">
        {row.map((day) => {
          const dayDate = new Date(currentYear, currentMonth, day);
          const isFuture = dayDate > today;
          const isSelected = selectedEntry?.dayNumber === day;
          const isToday = today.getFullYear() === currentYear && 
                         today.getMonth() === currentMonth && 
                         today.getDate() === day;
          
          // Check if there's a journal entry for this day
          const hasJournal = journals.some(j => {
            const jDate = new Date(j.date);
            return jDate.getDate() === day;
          });

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isFuture || !hasJournal}
              className={`
                flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl transition-all duration-200
                ${isFuture || !hasJournal
                  ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                  : `${isSelected ? 'bg-blue-400 ring-4 ring-blue-300' : 'bg-gray-200 hover:bg-gray-300'} cursor-pointer`
                }
                ${isToday && !isSelected ? 'ring-2 ring-blue-400' : ''}
              `}
            >
              <span className={`text-lg md:text-2xl font-bold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                {day}
              </span>
            </button>
          );
        })}
      </div>
    ));
  };

  // Show loading state while checking authentication or redirecting
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header Section */}
      <header className="max-w-6xl mx-auto mb-8">
        <nav className="flex items-center justify-center gap-6">
          <button className="text-gray-600 hover:text-gray-800 transition-colors" aria-label="Settings">
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <Link href="/" className="text-gray-900 hover:text-gray-700 transition-colors text-lg md:text-xl font-medium">
            Home
          </Link>
          <Link href="/journal" className="text-blue-600 hover:text-blue-700 transition-colors text-lg md:text-xl font-semibold">
            Journal
          </Link>
          <button className="text-gray-900 hover:text-gray-700 transition-colors text-lg md:text-xl font-medium">
            About
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto h-[calc(100vh-120px)]">
        {/* Single Container with Calendar and Journal */}
        <div className="bg-gradient-to-br from-white to-blue-100 rounded-3xl shadow-xl p-6 md:p-10 h-full flex flex-col lg:flex-row gap-8 lg:gap-12 overflow-hidden">
          {/* Left Side - Calendar */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="mb-6">
              <h3 className="text-sm md:text-base font-normal text-gray-500 mb-1">Mood Tracking</h3>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
                {monthNames[currentMonth]}
              </h2>
            </div>
            
            {/* Horizontal divider */}
            <div className="h-px bg-gray-300 mb-8" />
            
            {/* Calendar Grid */}
            <div className="space-y-4 overflow-y-auto flex-1">
              {renderCalendar()}
            </div>
          </div>

          {/* Right Side - Journal Entry */}
          <div className="lg:w-1/2 flex flex-col overflow-y-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">Journal:</h3>
            
            {selectedEntry ? (
              <div className="flex-1">
                {/* Date and Mood Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 md:w-20 md:h-20">
                      <img 
                        src={getMoodEmojiSrc(selectedEntry.mood)} 
                        alt={selectedEntry.mood}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-5xl md:text-6xl font-bold text-gray-800">
                        {selectedEntry.dayNumber}
                        <sup className="text-2xl md:text-3xl font-bold align-super">
                          {selectedEntry.dayNumber === 1 || selectedEntry.dayNumber === 21 || selectedEntry.dayNumber === 31 ? 'st' : 
                           selectedEntry.dayNumber === 2 || selectedEntry.dayNumber === 22 ? 'nd' : 
                           selectedEntry.dayNumber === 3 || selectedEntry.dayNumber === 23 ? 'rd' : 'th'}
                        </sup>
                      </div>
                      <div className="text-lg md:text-xl text-gray-600">
                        {selectedEntry.dayName}, {selectedEntry.monthName}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleEdit}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      aria-label="Edit"
                    >
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete"
                    >
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Journal Text */}
                <div className="bg-blue-50 rounded-2xl p-6 md:p-8">
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    {selectedEntry.notes}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center flex-1 text-gray-400">
                <p className="text-lg">Select a day with a mood entry to view the journal</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
