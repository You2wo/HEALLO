"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { goalApi } from "@/lib/api";

// Preset daily goals for each category
const PRESET_GOALS = {
  "Connection & Social": [
    {
      title: "Call or message a friend",
      description: "Reach out to someone you care about",
      icon: "💬",
      period: "Daily"
    },
    {
      title: "Have a meaningful conversation",
      description: "Connect deeply with someone today",
      icon: "🤝",
      period: "Daily"
    },
    {
      title: "Join a social activity",
      description: "Participate in a group activity or event",
      icon: "👥",
      period: "Weekly"
    }
  ],
  "Self-Care & Wellness": [
    {
      title: "Take a 15-minute walk",
      description: "Get some fresh air and movement",
      icon: "🚶",
      period: "Daily"
    },
    {
      title: "Practice mindfulness or meditation",
      description: "Spend 10 minutes in quiet reflection",
      icon: "🧘",
      period: "Daily"
    },
    {
      title: "Get 7-8 hours of sleep",
      description: "Prioritize rest and recovery",
      icon: "😴",
      period: "Daily"
    }
  ],
  "Growth & Expression": [
    {
      title: "Work on a creative project",
      description: "Spend time on art, writing, or music",
      icon: "🎨",
      period: "Daily"
    },
    {
      title: "Learn something new",
      description: "Read, watch, or practice a new skill",
      icon: "📚",
      period: "Daily"
    },
    {
      title: "Express yourself creatively",
      description: "Create something that represents you",
      icon: "✨",
      period: "Weekly"
    }
  ]
};

export default function PersonalizationPage() {
  const router = useRouter();
  const [stressDealing, setStressDealing] = useState<string[]>([]);
  const [improvement, setImprovement] = useState<string[]>([]);
  const [fulfillment, setFulfillment] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleOption = (category: 'stress' | 'improvement' | 'fulfillment', option: string) => {
    const setters = {
      stress: setStressDealing,
      improvement: setImprovement,
      fulfillment: setFulfillment
    };
    const values = {
      stress: stressDealing,
      improvement: improvement,
      fulfillment: fulfillment
    };

    const currentValues = values[category];
    const setter = setters[category];

    if (currentValues.includes(option)) {
      setter(currentValues.filter(item => item !== option));
    } else {
      setter([...currentValues, option]);
    }
  };

  const calculateCategory = (): "Connection & Social" | "Self-Care & Wellness" | "Growth & Expression" => {
    const scores = {
      "Connection & Social": 0,
      "Self-Care & Wellness": 0,
      "Growth & Expression": 0
    };

    // Score based on stress dealing
    if (stressDealing.includes("I talk to someone or spend time with friends")) {
      scores["Connection & Social"] += 1;
    }
    if (stressDealing.includes("I rest, take a walk, or do something relaxing")) {
      scores["Self-Care & Wellness"] += 1;
    }
    if (stressDealing.includes("I express myself through art, writing, or music")) {
      scores["Growth & Expression"] += 1;
    }

    // Score based on improvement
    if (improvement.includes("Building stronger relationships")) {
      scores["Connection & Social"] += 1;
    }
    if (improvement.includes("Taking better care of my mind and body")) {
      scores["Self-Care & Wellness"] += 1;
    }
    if (improvement.includes("Finding new ways to express my creativity")) {
      scores["Growth & Expression"] += 1;
    }

    // Score based on fulfillment
    if (fulfillment.includes("Talking and connecting with others")) {
      scores["Connection & Social"] += 1;
    }
    if (fulfillment.includes("Having a peaceful day and feeling healthy")) {
      scores["Self-Care & Wellness"] += 1;
    }
    if (fulfillment.includes("Creating, learning or discovering something new")) {
      scores["Growth & Expression"] += 1;
    }

    // Find the category with the highest score
    let maxScore = 0;
    let topCategory: "Connection & Social" | "Self-Care & Wellness" | "Growth & Expression" = "Connection & Social";
    
    for (const [category, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        topCategory = category as "Connection & Social" | "Self-Care & Wellness" | "Growth & Expression";
      }
    }

    return topCategory;
  };

  const handleSave = async () => {
    // Validate that at least one option is selected in each category
    if (stressDealing.length === 0 || improvement.length === 0 || fulfillment.length === 0) {
      alert("Please select at least one option for each question.");
      return;
    }

    setSaving(true);

    try {
      // Calculate the user's category
      const category = calculateCategory();

      // Save personalization data to localStorage
      localStorage.setItem("personalizationComplete", "true");
      localStorage.setItem("personalizationCategory", category);
      localStorage.setItem("personalizationData", JSON.stringify({
        stressDealing,
        improvement,
        fulfillment,
        category,
        completedAt: new Date().toISOString()
      }));

      // Create preset goals for the determined category
      const presetGoals = PRESET_GOALS[category];
      for (const goal of presetGoals) {
        try {
          await goalApi.create(goal);
        } catch (error) {
          console.error("Failed to create preset goal:", error);
        }
      }

      // Redirect to homepage with a flag to show the modal
      localStorage.setItem("showPersonalizationResult", "true");
      router.push("/");
    } catch (error) {
      console.error("Failed to save personalization:", error);
      alert("Failed to save personalization. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/personalization.svg')",
          backgroundPosition: "bottom center",
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-2">
            Personalization
          </h1>
          <p className="text-gray-600 text-lg">
            fill out this short questionaire to get started!
          </p>
        </div>

        {/* Questions Container */}
        <div className="max-w-4xl mx-auto space-y-6 pb-32">
          {/* Question 1 */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              How do you usually deal with stress or bad days?
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-4 p-4 border-2 border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={stressDealing.includes("I talk to someone or spend time with friends")}
                    onChange={() => toggleOption('stress', "I talk to someone or spend time with friends")}
                    className="appearance-none w-6 h-6 border-2 border-blue-400 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                  />
                  {stressDealing.includes("I talk to someone or spend time with friends") && (
                    <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">I talk to someone or spend time with friends</span>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={stressDealing.includes("I rest, take a walk, or do something relaxing")}
                    onChange={() => toggleOption('stress', "I rest, take a walk, or do something relaxing")}
                    className="appearance-none w-6 h-6 border-2 border-blue-400 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                  />
                  {stressDealing.includes("I rest, take a walk, or do something relaxing") && (
                    <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">I rest, take a walk, or do something relaxing</span>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={stressDealing.includes("I express myself through art, writing, or music")}
                    onChange={() => toggleOption('stress', "I express myself through art, writing, or music")}
                    className="appearance-none w-6 h-6 border-2 border-blue-400 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                  />
                  {stressDealing.includes("I express myself through art, writing, or music") && (
                    <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">I express myself through art, writing, or music</span>
              </label>
            </div>
          </div>

          {/* Question 2 */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              What do you want to improve the most about yourself right now?
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-4 p-4 border-2 border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={improvement.includes("Building stronger relationships")}
                    onChange={() => toggleOption('improvement', "Building stronger relationships")}
                    className="appearance-none w-6 h-6 border-2 border-blue-400 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                  />
                  {improvement.includes("Building stronger relationships") && (
                    <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">Building stronger relationships</span>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={improvement.includes("Taking better care of my mind and body")}
                    onChange={() => toggleOption('improvement', "Taking better care of my mind and body")}
                    className="appearance-none w-6 h-6 border-2 border-blue-400 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                  />
                  {improvement.includes("Taking better care of my mind and body") && (
                    <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">Taking better care of my mind and body</span>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={improvement.includes("Finding new ways to express my creativity")}
                    onChange={() => toggleOption('improvement', "Finding new ways to express my creativity")}
                    className="appearance-none w-6 h-6 border-2 border-blue-400 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                  />
                  {improvement.includes("Finding new ways to express my creativity") && (
                    <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">Finding new ways to express my creativity</span>
              </label>
            </div>
          </div>

          {/* Question 3 */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              What kind of activities make you feel most fullfilled?
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-4 p-4 border-2 border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={fulfillment.includes("Talking and connecting with others")}
                    onChange={() => toggleOption('fulfillment', "Talking and connecting with others")}
                    className="appearance-none w-6 h-6 border-2 border-blue-400 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                  />
                  {fulfillment.includes("Talking and connecting with others") && (
                    <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">Talking and connecting with others</span>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={fulfillment.includes("Having a peaceful day and feeling healthy")}
                    onChange={() => toggleOption('fulfillment', "Having a peaceful day and feeling healthy")}
                    className="appearance-none w-6 h-6 border-2 border-blue-400 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                  />
                  {fulfillment.includes("Having a peaceful day and feeling healthy") && (
                    <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">Having a peaceful day and feeling healthy</span>
              </label>

              <label className="flex items-center gap-4 p-4 border-2 border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="relative flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={fulfillment.includes("Creating, learning or discovering something new")}
                    onChange={() => toggleOption('fulfillment', "Creating, learning or discovering something new")}
                    className="appearance-none w-6 h-6 border-2 border-blue-400 rounded checked:bg-blue-500 checked:border-blue-500 cursor-pointer"
                  />
                  {fulfillment.includes("Creating, learning or discovering something new") && (
                    <svg className="absolute top-0 left-0 w-6 h-6 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-700">Creating, learning or discovering something new</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-20 py-4 rounded-full shadow-lg transition-all hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
