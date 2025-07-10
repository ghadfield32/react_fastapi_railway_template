import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { getStoredToken } from '../contexts/AuthContext';

// Augment ImportMeta to include Vite's env types
declare global {
  interface ImportMeta {
    env: {
      DEV: boolean;
      PROD: boolean;
      VITE_API_URL: string;
    };
  }
}

/**
 * Get the normalized API root URL from Vite's environment.
 * This is guaranteed to be a valid absolute URL by vite.config.ts
 */
const root = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
export const api = axios.create({ baseURL: `${root}/api` });

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const t = getStoredToken();
  if (t) {
    if (!cfg.headers) cfg.headers = new AxiosHeaders();
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
}); 



