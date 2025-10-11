"use client";

import React, { useState } from "react";

interface DailyGoal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  icon?: string;
}

interface DailyGoalsProps {
  goals?: DailyGoal[];
}

export const DailyGoals: React.FC<DailyGoalsProps> = ({ 
  goals: initialGoals = [
    { 
      id: "1",
      title: "Check the weather!", 
      description: "take a walk around the neighbourhood and get some fresh air for 5 minutes ...",
      completed: false,
      icon: "☁️"
    },
    { 
      id: "2",
      title: "Check the weather!", 
      description: "",
      completed: true,
      icon: "☁️"
    },
    { 
      id: "3",
      title: "Check the weather!", 
      description: "take a walk around the neighbourhood and get some fresh air for 5 minutes ...",
      completed: false,
      icon: "☁️"
    }
  ]
}) => {
  const [goals, setGoals] = useState<DailyGoal[]>(initialGoals);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routineName, setRoutineName] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("Daily");

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form
    setRoutineName("");
    setDescription("");
    setPeriod("Daily");
  };

  const handleSaveRoutine = () => {
    // Add new routine logic here
    const newGoal: DailyGoal = {
      id: Date.now().toString(),
      title: routineName,
      description: description,
      completed: false,
      icon: "🌱"
    };
    setGoals([...goals, newGoal]);
    handleCloseModal();
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Daily Goals</h2>
        
        {/* Add New Routine Button */}
        <button 
          onClick={handleOpenModal}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg py-4 rounded-2xl mb-6 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-2xl">+</span>
          <span>Add new routine!</span>
        </button>
      
      {/* Goals List - Scrollable (shows ~2 items) */}
      <div className="space-y-4 overflow-y-auto pr-2 max-h-[280px]">
        {goals.map((goal) => (
          <div 
            key={goal.id}
            className={`border-2 rounded-2xl p-4 transition-all ${
              goal.completed 
                ? 'border-blue-300 bg-blue-50/50' 
                : 'border-blue-400 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                  goal.completed
                    ? 'bg-blue-400 border-blue-400'
                    : 'bg-white border-blue-600'
                }`}
              >
                {goal.completed && (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className={`font-semibold text-gray-900 flex items-center gap-2 ${
                    goal.completed ? 'line-through text-gray-500' : ''
                  }`}>
                    {goal.title}
                    {goal.icon && <span className="text-lg">{goal.icon}</span>}
                  </h3>
                  <span className="text-sm text-blue-500 font-medium flex-shrink-0">today</span>
                </div>
                
                {goal.description && !goal.completed && (
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
          onClick={handleCloseModal}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          {/* Modal Content */}
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-popUp my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M24 8L8 24M8 8L24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="pt-2">
              <h2 className="text-3xl font-bold text-blue-600 mb-8">
                Let&apos;s make a new routine!
              </h2>

              {/* Routine Name Input */}
              <div className="mb-6">
                <label className="block text-gray-500 text-sm mb-2">
                  Routine Name:
                </label>
                <input
                  type="text"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full px-4 py-3 border-b-2 border-blue-400 focus:border-blue-600 outline-none transition-colors bg-pink-50/30 text-gray-900 rounded-lg"
                  placeholder=""
                />
              </div>

              {/* Description Input */}
              <div className="mb-6">
                <label className="block text-gray-500 text-sm mb-2">
                  Description:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  className="w-full px-4 py-3 border-b-2 border-blue-400 focus:border-blue-600 outline-none transition-colors bg-pink-50/30 resize-none text-gray-900 rounded-lg"
                  rows={3}
                  placeholder=""
                />
              </div>

              {/* Period Selection */}
              <div className="mb-6">
                <label className="block text-gray-500 text-sm mb-3">
                  Period:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Daily", "Biweekly", "Weekly", "Monthly"].map((option) => (
                    <button
                      key={option}
                      onClick={() => setPeriod(option)}
                      className={`py-3 px-4 rounded-xl border-2 transition-all ${
                        period === option
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-600 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            period === option
                              ? "border-blue-500"
                              : "border-gray-400"
                          }`}
                        >
                          {period === option && (
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Character and Save Button */}
              <div className="flex items-end justify-between mt-8">
                <div className="w-32">
                  <img
                    src="/addroutinemodal.svg"
                    alt="Character"
                    className="w-full h-auto"
                  />
                </div>
                <button
                  onClick={handleSaveRoutine}
                  disabled={!routineName.trim()}
                  className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Save Routine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes popUp {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          50% {
            transform: scale(1.05) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-popUp {
          animation: popUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
};
