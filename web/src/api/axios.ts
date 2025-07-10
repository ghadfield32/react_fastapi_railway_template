import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getStoredToken } from '../contexts/AuthContext';

declare const __API_URL__: string;  // Declare the injected constant

const root = __API_URL__;              // Now guaranteed absolute
export const api = axios.create({ baseURL: `${root}/api` });

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const t = getStoredToken();
  cfg.headers = cfg.headers || {};
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
}); 

/* ---------- global 401 handler --------------- */
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      // Clear the invalid token
      localStorage.removeItem('jwt');
      // Show friendly message to user
      alert(
        'Your session expired (401). Please log out and log back in so a new token can be issued.'
      );
      // Note: Optionally force refresh with: window.location.reload();
    }
    return Promise.reject(error);
  }
); 

