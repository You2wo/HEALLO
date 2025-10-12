# 🚀 Quick Start Guide

Get your backend up and running in minutes!

## ✅ What's Already Done

Your backend is **fully set up and ready to use**! Here's what's been configured:

- ✅ Database schema created (SQLite)
- ✅ Database initialized and migrated
- ✅ All API routes implemented
- ✅ Authentication system with JWT
- ✅ API client utilities
- ✅ TypeScript types

## 🎯 Start Using the Backend (3 Steps)

### Step 1: Start the Development Server

```bash
npm run dev
```

Your API is now running at `http://localhost:3000/api`

### Step 2: Test the API (Optional)

Open a new terminal and run:

```bash
node test-api.js
```

This will test all endpoints and confirm everything is working.

### Step 3: Integrate with Your Frontend

See `INTEGRATION_EXAMPLES.md` for detailed examples, or use this quick example:

```typescript
// In any component
import { authApi, goalApi } from '@/lib/api';

// Register a user
const response = await authApi.register({
  username: 'john',
  email: 'john@example.com',
  password: 'password123'
});

// Create a goal
await goalApi.create({
  title: 'Morning Exercise',
  description: 'Do 20 push-ups',
  period: 'Daily'
});
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | API client - use this in your components |
| `src/lib/auth.ts` | Authentication utilities |
| `src/contexts/AuthContext.tsx` | React context for auth state |
| `prisma/schema.prisma` | Database schema |
| `API_DOCUMENTATION.md` | Complete API reference |
| `INTEGRATION_EXAMPLES.md` | Code examples for frontend |

## 🔑 Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Journals
- `GET /api/journals` - Get all journals
- `POST /api/journals` - Create journal entry
- `PUT /api/journals/[id]` - Update journal
- `DELETE /api/journals/[id]` - Delete journal

### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PATCH /api/goals/[id]` - Toggle goal completion
- `DELETE /api/goals/[id]` - Delete goal

### Moods
- `GET /api/moods` - Get all moods
- `POST /api/moods` - Save mood

### Streak
- `GET /api/streak` - Get current streak

### Pet
- `GET /api/pet` - Get pet settings
- `PUT /api/pet` - Update pet settings

## 💡 Quick Integration Example

### 1. Wrap your app with AuthProvider

```typescript
// src/app/layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
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

### 2. Use in your components

```typescript
// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push("/");
    } catch (error) {
      alert("Login failed: " + error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

### 3. Load and display data

```typescript
// src/app/components/DailyGoals.tsx
"use client";

import { useEffect, useState } from "react";
import { goalApi } from "@/lib/api";

export function DailyGoals() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const { goals } = await goalApi.getAll();
      setGoals(goals);
    } catch (error) {
      console.error("Failed to load goals:", error);
    }
  };

  const toggleGoal = async (id) => {
    try {
      await goalApi.toggle(id);
      loadGoals(); // Reload goals
    } catch (error) {
      console.error("Failed to toggle goal:", error);
    }
  };

  return (
    <div>
      <h2>Daily Goals</h2>
      {goals.map(goal => (
        <div key={goal.id}>
          <input
            type="checkbox"
            checked={goal.completed}
            onChange={() => toggleGoal(goal.id)}
          />
          <span>{goal.title}</span>
        </div>
      ))}
    </div>
  );
}
```

## 🛠️ Useful Commands

```bash
# Start dev server
npm run dev

# View database in browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma db push --force-reset

# Generate Prisma client (after schema changes)
npx prisma generate

# Test API endpoints
node test-api.js
```

## 🔍 Debugging

### Check if API is working
```bash
# Test registration endpoint
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'
```

### View database
```bash
npx prisma studio
```
Opens a web interface at `http://localhost:5555`

### Check logs
Look at your terminal where `npm run dev` is running for error messages.

## 📚 Next Steps

1. ✅ **Read** `INTEGRATION_EXAMPLES.md` for detailed code examples
2. ✅ **Check** `API_DOCUMENTATION.md` for complete API reference
3. ✅ **Review** `BACKEND_README.md` for detailed setup information
4. ✅ **Integrate** the API into your existing components
5. ✅ **Test** your integration with real data

## 🆘 Common Issues

### "Unauthorized" errors
- Make sure you're logged in
- Check that the token is being sent with requests
- Token is automatically managed by the API client

### Database errors
- Run `npx prisma generate` to regenerate the client
- Run `npx prisma db push` to sync the database

### CORS errors
- Make sure you're making requests to the same domain
- In development, both frontend and API run on localhost:3000

## 🎉 You're Ready!

Your backend is fully functional and ready to use. Start integrating it with your frontend components using the examples provided.

**Need help?** Check the documentation files:
- `API_DOCUMENTATION.md` - API reference
- `INTEGRATION_EXAMPLES.md` - Code examples
- `BACKEND_README.md` - Detailed setup guide

**Happy coding! 🚀**
