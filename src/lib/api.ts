// API client utility for making authenticated requests

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Get token from localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Save token to localStorage
export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

// Remove token from localStorage
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

// Make authenticated API request
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.error || 'An error occurred');
  }

  return data;
}

// Auth API
export const authApi = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    nickname?: string;
  }) => {
    const response = await apiRequest<{ user: any; token: string; message: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
    if (response.token) {
      saveToken(response.token);
    }
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest<{ user: any; token: string; message: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
    if (response.token) {
      saveToken(response.token);
    }
    return response;
  },

  logout: () => {
    removeToken();
  },

  getMe: async () => {
    return apiRequest<{ user: any }>('/api/auth/me');
  },
};

// Journal API
export const journalApi = {
  getAll: async (params?: { month?: number; year?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    
    const query = queryParams.toString();
    return apiRequest<{ journals: any[] }>(
      `/api/journals${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: string) => {
    return apiRequest<{ journal: any }>(`/api/journals/${id}`);
  },

  create: async (journalData: {
    date: string;
    mood: string;
    notes?: string;
  }) => {
    return apiRequest<{ journal: any; message: string }>('/api/journals', {
      method: 'POST',
      body: JSON.stringify(journalData),
    });
  },

  update: async (id: string, journalData: { mood?: string; notes?: string }) => {
    return apiRequest<{ journal: any; message: string }>(`/api/journals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(journalData),
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/journals/${id}`, {
      method: 'DELETE',
    });
  },
};

// Mood API
export const moodApi = {
  getAll: async (params?: { month?: number; year?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append('month', params.month.toString());
    if (params?.year) queryParams.append('year', params.year.toString());
    
    const query = queryParams.toString();
    return apiRequest<{ moods: any[] }>(
      `/api/moods${query ? `?${query}` : ''}`
    );
  },

  save: async (moodData: { date: string; mood: string }) => {
    return apiRequest<{ mood: any; message: string }>('/api/moods', {
      method: 'POST',
      body: JSON.stringify(moodData),
    });
  },
};

// Goal API
export const goalApi = {
  getAll: async (params?: { completed?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.completed !== undefined) {
      queryParams.append('completed', params.completed.toString());
    }
    
    const query = queryParams.toString();
    return apiRequest<{ goals: any[] }>(
      `/api/goals${query ? `?${query}` : ''}`
    );
  },

  getById: async (id: string) => {
    return apiRequest<{ goal: any }>(`/api/goals/${id}`);
  },

  create: async (goalData: {
    title: string;
    description?: string;
    icon?: string;
    period?: string;
  }) => {
    return apiRequest<{ goal: any; message: string }>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  },

  update: async (
    id: string,
    goalData: {
      title?: string;
      description?: string;
      icon?: string;
      period?: string;
      completed?: boolean;
    }
  ) => {
    return apiRequest<{ goal: any; message: string }>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
  },

  toggle: async (id: string) => {
    return apiRequest<{ goal: any; message: string }>(`/api/goals/${id}`, {
      method: 'PATCH',
    });
  },

  delete: async (id: string) => {
    return apiRequest<{ message: string }>(`/api/goals/${id}`, {
      method: 'DELETE',
    });
  },
};

// Streak API
export const streakApi = {
  get: async () => {
    return apiRequest<{ streak: any }>('/api/streak');
  },
};

// Pet API
export const petApi = {
  get: async () => {
    return apiRequest<{ petSettings: any }>('/api/pet');
  },

  update: async (petData: {
    petName?: string;
    petType?: string;
    petLevel?: number;
    petXp?: number;
  }) => {
    return apiRequest<{ petSettings: any; message: string }>('/api/pet', {
      method: 'PUT',
      body: JSON.stringify(petData),
    });
  },
};
