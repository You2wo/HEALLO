# Frontend Integration Examples

This document shows how to integrate the backend API with your existing frontend components.

## Setup: Add AuthProvider to Layout

First, wrap your app with the AuthProvider in `src/app/layout.tsx`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

---

## Example 1: Login Page with Backend

Update `src/app/login/page.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/"); // Redirect to home page
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="w-full p-8 md:p-16">
        {/* Navigation */}
        <nav className="flex items-center justify-center gap-6 mb-16">
          {/* ... existing nav ... */}
        </nav>

        {/* Login Form */}
        <div className="flex-1 flex justify-center items-start pt-8">
          <div className="w-full max-w-xl">
            <h1 className="text-6xl font-bold text-gray-800 mb-12">Login</h1>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

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
                  disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-3 rounded-full shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Example 2: Register Page with Backend

Update `src/app/register/page.tsx`:

```typescript
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password, nickname);
      router.push("/personalization"); // Redirect to personalization
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... existing JSX with error display and loading state
  );
}
```

---

## Example 3: DailyGoals Component with Backend

Update `src/app/components/DailyGoals.tsx`:

```typescript
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
  period: string;
}

export const DailyGoals: React.FC = () => {
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) return;

    try {
      await goalApi.create({
        title: routineName,
        description: description,
        icon: "🌱",
        period: period,
      });
      
      // Reload goals
      await loadGoals();
      
      // Close modal and reset form
      handleCloseModal();
    } catch (error) {
      console.error("Failed to create goal:", error);
      alert("Failed to create goal. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRoutineName("");
    setDescription("");
    setPeriod("Daily");
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
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg py-4 rounded-2xl mb-6 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-2xl">+</span>
          <span>Add new routine!</span>
        </button>
      
        {/* Goals List */}
        <div className="space-y-4 overflow-y-auto pr-2 max-h-[280px]">
          {loading ? (
            <p className="text-gray-500 text-center">Loading goals...</p>
          ) : goals.length === 0 ? (
            <p className="text-gray-500 text-center">No goals yet. Add your first routine!</p>
          ) : (
            goals.map((goal) => (
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
                      <span className="text-sm text-blue-500 font-medium flex-shrink-0">
                        {goal.period.toLowerCase()}
                      </span>
                    </div>
                    
                    {goal.description && !goal.completed && (
                      <p className="text-sm text-gray-400 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal - same as before but with handleSaveRoutine updated */}
      {/* ... existing modal code ... */}
    </>
  );
};
```

---

## Example 4: Streak Component with Backend

Update `src/app/components/Streak.tsx`:

```typescript
"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { streakApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export const Streak: React.FC = () => {
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
  }, [isAuthenticated]);

  const loadStreak = async () => {
    try {
      const response = await streakApi.get();
      setDays(response.streak.currentStreak);
    } catch (error) {
      console.error("Failed to load streak:", error);
    }
  };

  // ... rest of component remains the same
};
```

---

## Example 5: MoodTracking Component with Backend

Update `src/app/components/MoodTracking.tsx` to save moods to the backend:

```typescript
const handleMoodSelect = async (mood: MoodType) => {
  if (selectedDay === null) return;
  
  const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  
  try {
    // Save to backend
    await moodApi.save({
      date: new Date(currentYear, currentMonth, selectedDay).toISOString(),
      mood: mood
    });
    
    // Update local state
    const newMoodData = { ...moodData, [dateKey]: mood };
    saveMoodData(newMoodData);
    
    setShowSelector(false);
    setSelectedDay(null);
  } catch (error) {
    console.error("Failed to save mood:", error);
    alert("Failed to save mood. Please try again.");
  }
};
```

---

## Example 6: Protected Route

Create a protected route wrapper:

```typescript
// src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

Use it in your pages:

```typescript
// src/app/page.tsx
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
      {/* Your home page content */}
    </ProtectedRoute>
  );
}
```

---

## Example 7: Loading Data on Page Load

```typescript
"use client";

import { useEffect, useState } from "react";
import { journalApi, goalApi, streakApi } from "@/lib/api";

export default function HomePage() {
  const [journals, setJournals] = useState([]);
  const [goals, setGoals] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [journalsRes, goalsRes, streakRes] = await Promise.all([
        journalApi.getAll(),
        goalApi.getAll(),
        streakApi.get()
      ]);

      setJournals(journalsRes.journals);
      setGoals(goalsRes.goals);
      setStreak(streakRes.streak.currentStreak);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    // Your page content
  );
}
```

---

## Tips for Integration

1. **Error Handling**: Always wrap API calls in try-catch blocks
2. **Loading States**: Show loading indicators during API calls
3. **Optimistic Updates**: Update UI immediately, then sync with backend
4. **Token Management**: The API client handles tokens automatically
5. **Authentication**: Use the AuthContext for user state management
6. **Data Refresh**: Reload data after mutations (create, update, delete)

---

## Testing Your Integration

1. Start the dev server: `npm run dev`
2. Open the app in your browser
3. Register a new account
4. Try creating goals, journal entries, etc.
5. Check the database with: `npx prisma studio`

---

**Happy Integrating! 🚀**
