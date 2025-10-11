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

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ));
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Daily Goals</h2>
      
      {/* Add New Routine Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg py-4 rounded-2xl mb-6 transition-colors flex items-center justify-center gap-2">
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
  );
};
