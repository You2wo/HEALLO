# Backend Setup Guide

This guide will help you set up and use the backend API for your Mental Health Journal application.

## 🚀 Features

The backend provides a complete REST API with the following features:

- ✅ **User Authentication** - Register, login, and JWT-based authentication
- ✅ **Journal Management** - Create, read, update, and delete journal entries
- ✅ **Mood Tracking** - Track daily moods with calendar integration
- ✅ **Daily Goals** - Create and manage daily routines and goals
- ✅ **Streak Tracking** - Automatic calculation of consecutive days
- ✅ **Pet Settings** - Manage virtual pet customization
- ✅ **Database Persistence** - All data stored in SQLite database

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🛠️ Installation

All dependencies are already installed. The backend uses:

- **Prisma** - Database ORM
- **SQLite** - Database (easy setup, no external DB required)
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## 🗄️ Database Setup

The database has already been initialized. The SQLite database file is located at:
```
prisma/dev.db
```

### Database Schema

The application includes the following models:

1. **User** - User accounts
2. **Journal** - Journal entries with mood and notes
3. **Mood** - Mood tracking entries
4. **Goal** - Daily goals and routines
5. **Streak** - Streak tracking
6. **PetSettings** - Pet customization

### Prisma Commands

If you need to make changes to the database schema:

```bash
# Edit the schema
# Open prisma/schema.prisma and make your changes

# Apply changes to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio
```

## 🔐 Environment Variables

The `.env` file contains:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-12345"
```

**Important:** Change the `JWT_SECRET` to a secure random string in production!

## 🚀 Running the Application

Start the development server:

```bash
npm run dev
```

The API will be available at: `http://localhost:3000/api`

## 📚 API Documentation

Complete API documentation is available in `API_DOCUMENTATION.md`.

### Quick API Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Journals
- `GET /api/journals` - Get all journals
- `POST /api/journals` - Create journal entry
- `GET /api/journals/[id]` - Get specific journal
- `PUT /api/journals/[id]` - Update journal
- `DELETE /api/journals/[id]` - Delete journal

#### Moods
- `GET /api/moods` - Get all moods
- `POST /api/moods` - Save mood entry

#### Goals
- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `GET /api/goals/[id]` - Get specific goal
- `PUT /api/goals/[id]` - Update goal
- `PATCH /api/goals/[id]` - Toggle goal completion
- `DELETE /api/goals/[id]` - Delete goal

#### Streak
- `GET /api/streak` - Get current streak

#### Pet
- `GET /api/pet` - Get pet settings
- `PUT /api/pet` - Update pet settings

## 💻 Using the API Client

A TypeScript API client is provided in `src/lib/api.ts` for easy integration with your frontend.

### Example Usage

```typescript
import { authApi, journalApi, goalApi, streakApi } from '@/lib/api';

// Register a user
const response = await authApi.register({
  username: 'johndoe',
  email: 'john@example.com',
  password: 'password123',
  nickname: 'John'
});

// Login
await authApi.login({
  email: 'john@example.com',
  password: 'password123'
});

// Create a journal entry
await journalApi.create({
  date: new Date().toISOString(),
  mood: 'good',
  notes: 'Had a great day!'
});

// Get all goals
const { goals } = await goalApi.getAll();

// Get current streak
const { streak } = await streakApi.get();
```

## 🔄 Integrating with Frontend Components

### Example: Update Login Page

```typescript
// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await authApi.login({ email, password });
      console.log("Logged in:", response.user);
      router.push("/"); // Redirect to home
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    // ... your existing JSX with handleLogin
  );
}
```

### Example: Update DailyGoals Component

```typescript
// src/app/components/DailyGoals.tsx
"use client";

import { useState, useEffect } from "react";
import { goalApi } from "@/lib/api";

export const DailyGoals = () => {
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

  const handleSaveRoutine = async (routineData) => {
    try {
      await goalApi.create(routineData);
      await loadGoals(); // Reload goals
    } catch (error) {
      console.error("Failed to create goal:", error);
    }
  };

  const toggleGoal = async (id: string) => {
    try {
      await goalApi.toggle(id);
      await loadGoals(); // Reload goals
    } catch (error) {
      console.error("Failed to toggle goal:", error);
    }
  };

  // ... rest of component
};
```

## 🧪 Testing the API

You can test the API using:

1. **Postman** or **Insomnia** - Import the endpoints from API_DOCUMENTATION.md
2. **curl** - Command line testing
3. **Prisma Studio** - View and edit database directly

### Example curl commands:

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get goals (with auth token)
curl -X GET http://localhost:3000/api/goals \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security Notes

1. **JWT Secret**: Change the JWT_SECRET in production to a secure random string
2. **Password Hashing**: Passwords are automatically hashed using bcrypt
3. **Authentication**: All protected routes require a valid JWT token
4. **CORS**: Configure CORS settings for production deployment

## 📦 Database Backup

To backup your database:

```bash
# Copy the database file
cp prisma/dev.db prisma/dev.db.backup
```

## 🚢 Production Deployment

For production deployment:

1. **Change JWT_SECRET** to a secure random string
2. **Use PostgreSQL** instead of SQLite for better performance:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. **Set up environment variables** on your hosting platform
4. **Run migrations**: `npx prisma migrate deploy`
5. **Enable HTTPS** for secure token transmission

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
npx prisma db push --force-reset

# Regenerate Prisma Client
npx prisma generate
```

### Token Issues
- Make sure the JWT_SECRET matches between requests
- Check token expiration (default: 7 days)
- Clear localStorage and login again

### CORS Issues
- Add CORS headers in `next.config.ts` if needed
- Ensure API requests use the correct base URL

## 📖 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [JWT.io](https://jwt.io/) - Debug JWT tokens

## 🤝 Support

For issues or questions:
1. Check the API_DOCUMENTATION.md file
2. Review the Prisma schema in `prisma/schema.prisma`
3. Check the API client in `src/lib/api.ts`

---

**Happy Coding! 🎉**
