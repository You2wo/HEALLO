"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function PersonalizationPage() {
  const [stressDealing, setStressDealing] = useState<string[]>(["I talk to someone or spend time with friends"]);
  const [improvement, setImprovement] = useState<string[]>(["Building stronger relationships"]);
  const [fulfillment, setFulfillment] = useState<string[]>(["Talking and connecting with others"]);

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

  const handleSave = () => {
    console.log("Saving personalization:", { stressDealing, improvement, fulfillment });
    // Add save logic here
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-20 py-4 rounded-full shadow-lg transition-all hover:shadow-xl text-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
