import axios, { InternalAxiosRequestConfig } from 'axios';
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

