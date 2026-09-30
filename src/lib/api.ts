// API client utility for making authenticated requests

import { localDateKey } from './dates';
import type { Mood } from './moods';
import type { LevelProgress } from './progress';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export type PersonalizationCategory = 'Connection & Social' | 'Self-Care & Wellness' | 'Growth & Expression';

export interface User {
  id: string;
  username: string;
  email: string;
  nickname: string | null;
  isDemo: boolean;
  personalization: PersonalizationCategory | null;
  createdAt: string;
}

export interface Journal {
  id: string;
  date: string;
  mood: Mood;
  notes: string | null;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: Mood | 'untracked';
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  period: string;
  completed: boolean;
}

// The pet, streak and today's mood, returned by every call that can change them.
export interface GameState {
  pet: { name: string } & LevelProgress;
  streak: { current: number; longest: number };
  moodToday: Mood | null;
}

interface AuthResponse {
  user: User;
  token: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

// Make authenticated API request
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Date': localDateKey(),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'Could not reach the server. Check your connection and try again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'Something went wrong. Please try again.');
  }

  return data;
}

function monthQuery(params?: { month?: number; year?: number }): string {
  return params?.month && params.year ? `?month=${params.month}&year=${params.year}` : '';
}

async function authenticate(endpoint: string, body?: unknown): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
  saveToken(response.token);
  return response;
}

// Auth API
export const authApi = {
  register: (userData: { username: string; email: string; password: string; nickname?: string }) =>
    authenticate('/api/auth/register', userData),

  login: (credentials: { email: string; password: string }) => authenticate('/api/auth/login', credentials),

  demo: () => authenticate('/api/auth/demo'),

  logout: () => removeToken(),

  getMe: () => apiRequest<{ user: User }>('/api/auth/me'),

  update: (data: { nickname?: string; personalization?: PersonalizationCategory }) =>
    apiRequest<{ user: User }>('/api/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),

  deleteAccount: (password: string) =>
    apiRequest<{ message: string }>('/api/auth/me', { method: 'DELETE', body: JSON.stringify({ password }) }),
};

// Journal API
export const journalApi = {
  getAll: (params?: { month?: number; year?: number }) =>
    apiRequest<{ journals: Journal[] }>(`/api/journals${monthQuery(params)}`),

  // `date` is a YYYY-MM-DD key in the user's timezone.
  save: (journalData: { date: string; mood: Mood; notes?: string }) =>
    apiRequest<{ journal: Journal } & GameState>('/api/journals', {
      method: 'POST',
      body: JSON.stringify(journalData),
    }),

  update: (id: string, journalData: { mood?: Mood; notes?: string }) =>
    apiRequest<{ journal: Journal } & GameState>(`/api/journals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(journalData),
    }),

  delete: (id: string) => apiRequest<GameState>(`/api/journals/${id}`, { method: 'DELETE' }),
};

// Mood API
export const moodApi = {
  getAll: (params?: { month?: number; year?: number }) =>
    apiRequest<{ moods: MoodEntry[] }>(`/api/moods${monthQuery(params)}`),
};

// Goal API
export const goalApi = {
  getAll: () => apiRequest<{ goals: Goal[] }>('/api/goals'),

  create: (goalData: { title: string; description?: string; icon?: string; period?: string }) =>
    apiRequest<{ goal: Goal }>('/api/goals', { method: 'POST', body: JSON.stringify(goalData) }),

  update: (id: string, goalData: { title?: string; description?: string; icon?: string; period?: string }) =>
    apiRequest<{ goal: Goal }>(`/api/goals/${id}`, { method: 'PUT', body: JSON.stringify(goalData) }),

  toggle: (id: string) => apiRequest<{ goal: Goal } & GameState>(`/api/goals/${id}`, { method: 'PATCH' }),

  delete: (id: string) => apiRequest<{ message: string }>(`/api/goals/${id}`, { method: 'DELETE' }),
};

// Pet API
export const petApi = {
  get: () => apiRequest<GameState>('/api/pet'),

  rename: (petName: string) =>
    apiRequest<GameState>('/api/pet', { method: 'PUT', body: JSON.stringify({ petName }) }),
};
