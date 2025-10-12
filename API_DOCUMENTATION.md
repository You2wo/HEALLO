# API Documentation

This document describes all available API endpoints for the Mental Health Journal application.

## Base URL
All API endpoints are relative to: `/api`

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "nickname": "string (optional)"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "nickname": "string",
    "createdAt": "datetime"
  },
  "token": "jwt-token"
}
```

---

### Login
**POST** `/api/auth/login`

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "nickname": "string",
    "createdAt": "datetime"
  },
  "token": "jwt-token"
}
```

---

### Get Current User
**GET** `/api/auth/me`

Get the currently authenticated user's information.

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "nickname": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

## Journal Endpoints

### Get All Journals
**GET** `/api/journals`

Get all journal entries for the authenticated user.

**Headers:** Requires Authorization

**Query Parameters:**
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year (e.g., 2024)

**Response (200):**
```json
{
  "journals": [
    {
      "id": "uuid",
      "userId": "uuid",
      "date": "datetime",
      "mood": "string",
      "notes": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

---

### Create Journal Entry
**POST** `/api/journals`

Create a new journal entry or update existing one for the same date.

**Headers:** Requires Authorization

**Request Body:**
```json
{
  "date": "string (ISO date, required)",
  "mood": "string (required: 'good', 'neutral', 'bad', 'stress', 'meh')",
  "notes": "string (optional)"
}
```

**Response (201 or 200):**
```json
{
  "message": "Journal created successfully",
  "journal": {
    "id": "uuid",
    "userId": "uuid",
    "date": "datetime",
    "mood": "string",
    "notes": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

### Get Journal by ID
**GET** `/api/journals/[id]`

Get a specific journal entry.

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "journal": {
    "id": "uuid",
    "userId": "uuid",
    "date": "datetime",
    "mood": "string",
    "notes": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

### Update Journal
**PUT** `/api/journals/[id]`

Update a journal entry.

**Headers:** Requires Authorization

**Request Body:**
```json
{
  "mood": "string (optional)",
  "notes": "string (optional)"
}
```

**Response (200):**
```json
{
  "message": "Journal updated successfully",
  "journal": { /* updated journal object */ }
}
```

---

### Delete Journal
**DELETE** `/api/journals/[id]`

Delete a journal entry.

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "message": "Journal deleted successfully"
}
```

---

## Mood Endpoints

### Get All Moods
**GET** `/api/moods`

Get all mood entries for the authenticated user.

**Headers:** Requires Authorization

**Query Parameters:**
- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year (e.g., 2024)

**Response (200):**
```json
{
  "moods": [
    {
      "id": "uuid",
      "userId": "uuid",
      "date": "datetime",
      "mood": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

---

### Save Mood
**POST** `/api/moods`

Create or update a mood entry for a specific date.

**Headers:** Requires Authorization

**Request Body:**
```json
{
  "date": "string (ISO date, required)",
  "mood": "string (required: 'good', 'neutral', 'bad', 'stress', 'meh', 'untracked')"
}
```

**Response (200):**
```json
{
  "message": "Mood saved successfully",
  "mood": {
    "id": "uuid",
    "userId": "uuid",
    "date": "datetime",
    "mood": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

## Goal Endpoints

### Get All Goals
**GET** `/api/goals`

Get all goals for the authenticated user.

**Headers:** Requires Authorization

**Query Parameters:**
- `completed` (optional): Filter by completion status (true/false)

**Response (200):**
```json
{
  "goals": [
    {
      "id": "uuid",
      "userId": "uuid",
      "title": "string",
      "description": "string",
      "icon": "string",
      "period": "string",
      "completed": "boolean",
      "completedAt": "datetime",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
  ]
}
```

---

### Create Goal
**POST** `/api/goals`

Create a new goal.

**Headers:** Requires Authorization

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "icon": "string (optional, default: '🌱')",
  "period": "string (optional, default: 'Daily', options: 'Daily', 'Weekly', 'Biweekly', 'Monthly')"
}
```

**Response (201):**
```json
{
  "message": "Goal created successfully",
  "goal": { /* goal object */ }
}
```

---

### Get Goal by ID
**GET** `/api/goals/[id]`

Get a specific goal.

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "goal": { /* goal object */ }
}
```

---

### Update Goal
**PUT** `/api/goals/[id]`

Update a goal.

**Headers:** Requires Authorization

**Request Body:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "icon": "string (optional)",
  "period": "string (optional)",
  "completed": "boolean (optional)"
}
```

**Response (200):**
```json
{
  "message": "Goal updated successfully",
  "goal": { /* updated goal object */ }
}
```

---

### Toggle Goal Completion
**PATCH** `/api/goals/[id]`

Toggle the completion status of a goal.

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "message": "Goal toggled successfully",
  "goal": { /* updated goal object */ }
}
```

---

### Delete Goal
**DELETE** `/api/goals/[id]`

Delete a goal.

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "message": "Goal deleted successfully"
}
```

---

## Streak Endpoints

### Get Streak
**GET** `/api/streak`

Get the current streak information for the authenticated user.

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "streak": {
    "id": "uuid",
    "userId": "uuid",
    "currentStreak": "number",
    "longestStreak": "number",
    "lastUpdated": "datetime",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

## Pet Settings Endpoints

### Get Pet Settings
**GET** `/api/pet`

Get pet settings for the authenticated user.

**Headers:** Requires Authorization

**Response (200):**
```json
{
  "petSettings": {
    "id": "uuid",
    "userId": "uuid",
    "petName": "string",
    "petType": "string",
    "petLevel": "number",
    "petXp": "number",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

### Update Pet Settings
**PUT** `/api/pet`

Update pet settings.

**Headers:** Requires Authorization

**Request Body:**
```json
{
  "petName": "string (optional)",
  "petType": "string (optional)",
  "petLevel": "number (optional)",
  "petXp": "number (optional)"
}
```

**Response (200):**
```json
{
  "message": "Pet settings updated successfully",
  "petSettings": { /* updated pet settings object */ }
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Error message describing what went wrong"
}
```

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**409 Conflict:**
```json
{
  "error": "Resource already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Usage Example (JavaScript/TypeScript)

```typescript
// Using the provided API client
import { authApi, journalApi, goalApi } from '@/lib/api';

// Register a new user
const registerUser = async () => {
  try {
    const response = await authApi.register({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'securepassword',
      nickname: 'John'
    });
    console.log('User registered:', response.user);
    // Token is automatically saved to localStorage
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Login
const login = async () => {
  try {
    const response = await authApi.login({
      email: 'john@example.com',
      password: 'securepassword'
    });
    console.log('Logged in:', response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Create a journal entry
const createJournal = async () => {
  try {
    const response = await journalApi.create({
      date: new Date().toISOString(),
      mood: 'good',
      notes: 'Had a great day today!'
    });
    console.log('Journal created:', response.journal);
  } catch (error) {
    console.error('Failed to create journal:', error);
  }
};

// Get all goals
const getGoals = async () => {
  try {
    const response = await goalApi.getAll();
    console.log('Goals:', response.goals);
  } catch (error) {
    console.error('Failed to get goals:', error);
  }
};
```

---

## Database Schema

The application uses the following database models:

- **User**: User accounts with authentication
- **Journal**: Daily journal entries with mood and notes
- **Mood**: Mood tracking entries
- **Goal**: Daily goals and routines
- **Streak**: User streak tracking
- **PetSettings**: Virtual pet customization

For detailed schema information, see `prisma/schema.prisma`.
