const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RequestOptions extends RequestInit {
  data?: any;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pulse_review_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (options.data) {
    if (typeof window !== 'undefined' && options.data instanceof FormData) {
      options.body = options.data;
    } else {
      headers.set('Content-Type', 'application/json');
      options.body = JSON.stringify(options.data);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.message || errorJson.error || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'POST', data }),
    
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'PUT', data }),
    
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
