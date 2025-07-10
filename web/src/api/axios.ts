import axios, { InternalAxiosRequestConfig } from 'axios';
import { getStoredToken } from '../contexts/AuthContext';

/**
 * Build a base-URL that is always absolute and always contains /api.
 * - dev  → proxy via Vite
 * - prod → value from VITE_API_URL (dashboard) + /api
 */
const buildBaseURL = () => {
  if (import.meta.env.DEV) return '/api';
  const raw = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');
  return `${raw}/api`;
};

export const api = axios.create({ baseURL: buildBaseURL() });

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const t = getStoredToken();
  if (t) {
    cfg.headers = cfg.headers ?? {};
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
}); 



