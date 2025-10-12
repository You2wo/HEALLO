"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { streakApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface StreakProps {
  days?: number;
}

export const Streak: React.FC<StreakProps> = () => {
  const [days, setDays] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadStreak();
    }
    
    // Listen for mood updates to refresh streak
    const handleMoodUpdate = () => {
      if (isAuthenticated) {
        loadStreak();
      }
    };
    
    window.addEventListener('moodUpdated', handleMoodUpdate);
    return () => window.removeEventListener('moodUpdated', handleMoodUpdate);
  }, [isAuthenticated]);

  const loadStreak = async () => {
    try {
      const response = await streakApi.get();
      setDays(response.streak.currentStreak as number);
    } catch (error) {
      console.error("Failed to load streak:", error);
    }
  };

  const handleStreakClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveAndShare = () => {
    // Add save and share functionality here
    console.log("Save and Share clicked");
  };

  return (
    <>
      <section
        className="flex justify-center md:justify-end"
        aria-label={`Streak counter showing ${days} days`}
      >
        <button
          onClick={handleStreakClick}
          className="relative bg-gradient-to-br from-orange-500 to-orange-400 rounded-3xl w-32 h-32 flex flex-col items-center justify-center shadow-xl overflow-hidden cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          {/* Fire background image */}
          <img 
            src="/fire.svg" 
            alt="" 
            className="absolute inset-0 w-full h-full object-cover"
            aria-hidden="true"
          />
          
          {/* Content */}
          <div className="relative z-10 text-center">
            <h2 className="text-lg font-normal text-white mb-1">Streak</h2>
            <div className="text-4xl font-bold text-white leading-none">
              {days}
            </div>
          </div>
        </button>
      </section>

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
            className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-popUp my-8"
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
            <div className="text-center pt-4">
              <p className="text-gray-600 text-lg mb-2">Congrats you&apos;re on a</p>
              <h2 className="text-5xl font-bold text-gray-900 mb-8">
                {days} Days Streak!
              </h2>

              {/* Character Image */}
              <div className="mb-8 flex justify-center">
                <img
                  src="/modalstreak.svg"
                  alt="Celebration character"
                  className="w-64 h-64 object-contain"
                />
              </div>

              {/* Save and Share Button */}
              <button
                onClick={handleSaveAndShare}
                className="bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold text-lg px-12 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Save and Share
              </button>
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
