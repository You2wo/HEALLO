"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const [nickname, setNickname] = useState("");
  const { componentScale, fontScale, setComponentScale, setFontScale } = useSettings();
  const { logout } = useAuth();
  const router = useRouter();

  const handleSave = () => {
    // Save nickname logic here
    console.log("Saving nickname:", nickname);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      router.push("/splash");
    }
  };

  const handleDeactivate = () => {
    if (confirm("Are you sure you want to deactivate your account? This action cannot be undone.")) {
      // Deactivate account logic here
      console.log("Deactivating account...");
    }
  };

  const handleResetSettings = () => {
    setComponentScale(1);
    setFontScale(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      {/* Header/Navigation */}
      <header className="max-w-6xl mx-auto mb-8">
        <nav className="flex items-center justify-center gap-6">
          <Link href="/settings" className="text-gray-600 hover:text-gray-800 transition-colors" aria-label="Settings">
            <svg className="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <Link href="/" className="text-gray-900 hover:text-gray-700 transition-colors text-lg md:text-xl font-medium">
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

      {/* Settings Content */}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-12">Settings</h1>

        {/* Main Settings Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
            {/* Pet Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0378FF' }}>
                <img 
                  src="/nickname.svg" 
                  alt="Pet Avatar" 
                  className="w-28 h-28 md:w-36 md:h-36"
                />
              </div>
            </div>

            {/* Nickname Input Section */}
            <div className="flex-1 w-full">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 mb-4 relative">
                <div className="absolute -top-3 left-6 bg-white px-2">
                  <p className="text-gray-600 text-sm">what should I call you?</p>
                </div>
                <input
                  type="text"
                  placeholder="Nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full text-lg text-gray-400 outline-none border-b-2 border-gray-200 pb-2 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-12 py-3 rounded-full shadow-lg transition-all hover:shadow-xl"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Settings Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Customization</h2>

          {/* Component Size Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-700">
                Component Size
              </label>
              <span className="text-lg font-bold text-blue-600">
                {Math.round(componentScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={componentScale}
              onChange={(e) => setComponentScale(parseFloat(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Small (70%)</span>
              <span>Normal (100%)</span>
              <span>Large (130%)</span>
            </div>
          </div>

          {/* Font Size Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-semibold text-gray-700">
                Font Size
              </label>
              <span className="text-lg font-bold text-blue-600">
                {Math.round(fontScale * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.05"
              value={fontScale}
              onChange={(e) => setFontScale(parseFloat(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>Small (80%)</span>
              <span>Normal (100%)</span>
              <span>Large (140%)</span>
            </div>
          </div>

          {/* Preview Text */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border-2 border-blue-200">
            <p className="text-gray-600 mb-2" style={{ fontSize: `calc(0.875rem * ${fontScale})` }}>
              Preview Text
            </p>
            <h3 className="font-bold text-gray-900 mb-2" style={{ fontSize: `calc(1.5rem * ${fontScale})` }}>
              This is how your text will look
            </h3>
            <p className="text-gray-600" style={{ fontSize: `calc(1rem * ${fontScale})` }}>
              Adjust the sliders above to customize the size of components and text throughout the app.
            </p>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleResetSettings}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-full transition-all"
            >
              Reset to Default
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={handleLogout}
            className="flex-1 bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 rounded-2xl border-2 border-blue-600 transition-all shadow-md hover:shadow-lg"
          >
            Logout
          </button>
          <button
            onClick={handleDeactivate}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg"
          >
            Deactive Account
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }

        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          transition: all 0.2s ease;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </div>
  );
}
