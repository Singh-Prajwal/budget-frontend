// src/api/apiClient.ts
import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://budget-tracker-0448.onrender.com/api',
});

// Request Interceptor: Attaches the access token to every outgoing request.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// A variable to prevent multiple simultaneous token refresh requests
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handles token expiration and refresh logic.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._isRetry) {
      if (isRefreshing) {
        // If a refresh is already in progress, we add the new failed request to a queue.
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._isRetry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<{ access: string; refresh?: string }>(
          `${apiClient.defaults.baseURL}/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access: newAccessToken, refresh: newRefreshToken } = response.data;

        // Store the new access token
        localStorage.setItem('accessToken', newAccessToken);

        // --- THIS IS THE KEY CHANGE ---
        // If the backend sent back a new refresh token (because of rotation), store it.
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Update the header on the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process the queue of failed requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Session expired. Please log in again.", refreshError);
        localStorage.clear();
        processQueue(refreshError, null);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;