import axios, { InternalAxiosRequestConfig } from 'axios';
import { getStoredToken } from '../contexts/AuthContext';

export const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL
});

api.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const t = getStoredToken();
  if (t) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${t}`;
  }
  return cfg;
}); 


