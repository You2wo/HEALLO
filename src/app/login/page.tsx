"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Logging in with:", { email, password });
    // Add login logic here
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="w-full p-8 md:p-16">
        {/* Navigation */}
        <nav className="flex items-center justify-center gap-6 mb-16">
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

        {/* Login Form */}
        <div className="flex-1 flex justify-center items-start pt-8">
          <div className="w-full max-w-xl">
            <h1 className="text-6xl font-bold text-gray-800 mb-12">Login</h1>

            <form onSubmit={handleLogin} className="space-y-8">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-gray-700 text-lg mb-3">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-gray-800"
                  required
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-gray-700 text-lg mb-3">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600 transition-colors text-gray-800"
                  required
                />
              </div>

              {/* Register Link and Login Button */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-gray-700">
                  No account?{" "}
                  <Link href="/register" className="text-blue-600 hover:text-blue-700 underline font-medium">
                    Register
                  </Link>
                </p>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-3 rounded-full shadow-lg transition-all hover:shadow-xl"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
