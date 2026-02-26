const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const fetchApi = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: options.credentials || 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${res.statusText}`);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const text = await res.text();
  return text ? JSON.parse(text) : {} as T;
};

