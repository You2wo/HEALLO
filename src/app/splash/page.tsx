"use client";

import React from "react";
import Link from "next/link";

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-white flex flex-col p-4 md:p-8">
      {/* Navigation */}
      <nav className="flex items-center justify-center gap-6 mb-8">
        <Link href="/settings" className="text-gray-600 hover:text-gray-800 transition-colors" aria-label="Settings">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
        <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
          Home
        </Link>
        <Link href="/journal" className="text-gray-900 hover:text-gray-700 transition-colors font-medium">
          Journal
        </Link>
        <button className="text-gray-900 hover:text-gray-700 transition-colors font-medium">
          About
        </button>
      </nav>

      {/* Main Content Container with Gradient */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-400 rounded-3xl md:rounded-[3rem] shadow-2xl p-8 md:p-16 w-full max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
          {/* Left Side - Pet Character */}
          <div className="flex-shrink-0">
            <img 
              src="/splash.svg" 
              alt="Heallo Character" 
              className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96"
            />
          </div>

          {/* Right Side - Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            {/* Heallo Logo/Title */}
            <div className="mb-8">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-blue-600 mb-2">
                Heallö
              </h1>
              <p className="text-blue-600 text-xl md:text-2xl">
                Say hello to <span className="italic">healing</span>
              </p>
            </div>

            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Hello! How are you?
              </h2>
              <p className="text-gray-700 text-lg md:text-xl">
                Get back into your account to start!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/login">
                <button className="w-full sm:w-44 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all hover:shadow-xl">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full sm:w-44 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all hover:shadow-xl">
                  Register
                </button>
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
