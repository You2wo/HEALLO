"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { goalApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface DailyGoal {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  icon?: string;
  period?: string;
}

interface DailyGoalsProps {
  goals?: DailyGoal[];
}

export const DailyGoals: React.FC<DailyGoalsProps> = () => {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [routineName, setRoutineName] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("Daily");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadGoals();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const response = await goalApi.getAll();
      setGoals(response.goals);
    } catch (error) {
      console.error("Failed to load goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGoal = async (id: string) => {
    try {
      await goalApi.toggle(id);
      // Update local state optimistically
      setGoals(goals.map(goal => 
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      ));
    } catch (error) {
      console.error("Failed to toggle goal:", error);
      // Reload goals if toggle fails
      loadGoals();
    }
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setEditingGoalId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: DailyGoal) => {
    setIsEditMode(true);
    setEditingGoalId(goal.id);
    setRoutineName(goal.title);
    setDescription(goal.description || "");
    setPeriod(goal.period || "Daily");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingGoalId(null);
    // Reset form
    setRoutineName("");
    setDescription("");
    setPeriod("Daily");
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) return;

    try {
      if (isEditMode && editingGoalId) {
        // Update existing goal
        await goalApi.update(editingGoalId, {
          title: routineName,
          description: description,
          period: period,
        });
      } else {
        // Create new goal
        await goalApi.create({
          title: routineName,
          description: description,
          icon: "🌱",
          period: period,
        });
      }
      
      // Reload goals
      await loadGoals();
      
      // Close modal and reset form
      handleCloseModal();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} goal:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} goal. Please try again.`);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;

    try {
      await goalApi.delete(id);
      // Reload goals
      await loadGoals();
    } catch (error) {
      console.error("Failed to delete goal:", error);
      alert("Failed to delete goal. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg p-6 md:p-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Daily Goals</h2>
        <p className="text-gray-600">Please log in to view your goals.</p>
      </div>
    );
  }

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
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-blue-500 font-medium">today</span>
                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(goal)}
                      className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                      aria-label="Edit goal"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      aria-label="Delete goal"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
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

      {/* Modal - Rendered via Portal */}
      {isModalOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn overflow-y-auto"
          onClick={handleCloseModal}
          style={{ transform: 'none' }}
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
                {isEditMode ? "Edit your routine!" : "Let's make a new routine!"}
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
                  {isEditMode ? "Update Routine" : "Save Routine"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
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
