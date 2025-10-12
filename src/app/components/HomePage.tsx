"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Streak } from "./Streak";
import { MoodTracking, calculateStreak } from "./MoodTracking";
import { DailyGoals } from "./DailyGoals";
import { PetGameScene } from "./PetGameScene";
import { PersonalizationResultModal } from "./PersonalizationResultModal";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";

export const HomePage = (): React.JSX.Element => {
  const [streak, setStreak] = useState(0);
  const [showMobileGoals, setShowMobileGoals] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(false);
  const [personalizationCategory, setPersonalizationCategory] = useState<"Connection & Social" | "Self-Care & Wellness" | "Growth & Expression">("Connection & Social");
  const { componentScale, fontScale } = useSettings();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect to splash if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/splash');
    }
  }, [isAuthenticated, loading, router]);

  // Check if we should show the personalization result modal
  useEffect(() => {
    if (isAuthenticated) {
      const shouldShowModal = localStorage.getItem("showPersonalizationResult");
      if (shouldShowModal === "true") {
        const category = localStorage.getItem("personalizationCategory") as "Connection & Social" | "Self-Care & Wellness" | "Growth & Expression" | null;
        if (category) {
          setPersonalizationCategory(category);
          setShowPersonalizationModal(true);
          // Clear the flag so it doesn't show again
          localStorage.removeItem("showPersonalizationResult");
        }
      }
    }
  }, [isAuthenticated]);

  // Calculate streak on mount and when localStorage changes
  useEffect(() => {
    const updateStreak = () => {
      setStreak(calculateStreak());
    };

    updateStreak();

    // Listen for storage changes to update streak when mood data changes
    window.addEventListener('storage', updateStreak);
    
    // Also listen for custom event when mood is updated in the same tab
    window.addEventListener('moodUpdated', updateStreak);

    return () => {
      window.removeEventListener('storage', updateStreak);
      window.removeEventListener('moodUpdated', updateStreak);
    };
  }, []);

  // Show loading state while checking authentication or redirecting
  if (loading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Personalization Result Modal */}
      {showPersonalizationModal && (
        <PersonalizationResultModal
          category={personalizationCategory}
          onClose={() => setShowPersonalizationModal(false)}
        />
      )}

    <main className="relative h-screen w-full overflow-hidden">
      {/* Full-page Game Scene Background */}
      <div className="absolute inset-0 w-full h-full">
        <PetGameScene className="w-full h-full" />
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 h-screen overflow-hidden p-4 md:p-8">
        {/* Header Section */}
        <header className="max-w-6xl mx-auto mb-8">
          <nav className="flex items-center justify-center gap-6">
            <Link href="/settings" className="text-gray-600 hover:text-gray-800 transition-colors" aria-label="Settings">
              <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors text-lg md:text-xl font-semibold">
              Home
            </Link>
            <Link href="/journal" className="text-gray-900 hover:text-gray-700 transition-colors text-lg md:text-xl font-medium">
              Journal
            </Link>
            <button className="text-gray-900 hover:text-gray-700 transition-colors text-lg md:text-xl font-medium">
              About
            </button>
          </nav>
        </header>

        {/* Desktop Layout - Components positioned at edges over game scene */}
        <div className="hidden md:block w-full relative">
          {/* Left Column - Mood Tracking & Daily Goals */}
          <div 
            className="absolute left-0 top-0 space-y-6 aspect-scale"
            style={{ 
              transform: `scale(${componentScale})`,
              transformOrigin: 'top left',
              fontSize: `${fontScale}rem`
            }}
          >
            <MoodTracking month="September" />
            <DailyGoals />
          </div>

          {/* Right Column - Streak - positioned at far right edge */}
          <div 
            className="absolute right-0 top-0 aspect-scale"
            style={{ 
              transform: `scale(${componentScale})`,
              transformOrigin: 'top right',
              fontSize: `${fontScale}rem`
            }}
          >
            <Streak days={streak} />
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          className="md:hidden fixed top-20 left-4 z-40 bg-white hover:bg-gray-50 rounded-xl p-3 shadow-xl transition-all"
          aria-label="Toggle schedule and streak"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {showMobileSidebar ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Schedule and Streak - Hide/Show */}
        {showMobileSidebar && (
          <div className="md:hidden fixed top-32 left-4 right-4 z-30 bg-white rounded-2xl shadow-2xl p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <MoodTracking month="September" />
            <Streak days={streak} />
          </div>
        )}

        {/* Mobile Bottom Sheet - Daily Goals */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
          {/* Bottom Sheet Handle */}
          <button
            onClick={() => setShowMobileGoals(!showMobileGoals)}
            className="w-full bg-white rounded-t-3xl shadow-2xl px-6 py-4 flex items-center justify-between"
          >
            <h2 className="text-xl font-bold text-gray-900">Daily Goals</h2>
            <svg
              className={`w-6 h-6 transition-transform ${showMobileGoals ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          {/* Bottom Sheet Content */}
          <div
            className={`bg-white transition-all duration-300 overflow-hidden ${
              showMobileGoals ? 'max-h-[70vh]' : 'max-h-0'
            }`}
          >
            <div className="px-6 pb-6 overflow-y-auto max-h-[70vh]">
              <DailyGoals />
            </div>
          </div>
        </div>

        {/* Chat/Help Button - Text Bubble Style */}
        <div className="fixed bottom-24 md:bottom-6 right-6 z-40 aspect-scale">
          <button className="bg-white hover:bg-gray-50 rounded-full px-6 py-4 flex items-center justify-center shadow-xl transition-all hover:shadow-2xl relative">
            <img 
              src="/tiny.svg" 
              alt="Chat" 
              className="w-8 h-10 md:w-10 md:h-12"
            />
            {/* Speech bubble tail */}
            <div className="absolute -bottom-2 right-6 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white"></div>
          </button>
        </div>
      </div>
    </main>
    </>
  );
};
