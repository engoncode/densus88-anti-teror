// src/services/api.ts
import axios, { AxiosError, type AxiosInstance } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Only redirect to login if not already on sign-in page
          if (!window.location.pathname.includes('/sign-in')) {
            // Unauthorized - clear auth and redirect to login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/sign-in';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  getInstance(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();
export const api = apiService.getInstance();
export default api;
