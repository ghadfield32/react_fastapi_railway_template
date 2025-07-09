import axios, { AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from "axios";
import { getStoredToken } from "../contexts/AuthContext";

export const http = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// attach token
http.interceptors.request.use((cfg: InternalAxiosRequestConfig) => {
  const t = getStoredToken();
  if (t) {
    cfg.headers = cfg.headers || new AxiosHeaders();
    cfg.headers.set('Authorization', `Bearer ${t}`);
  }
  return cfg;
});

// refresh or logout
http.interceptors.response.use(
  r => r,
  async (err: AxiosError) => {
    if (err.response?.status === 401) {
      try {
        const { data } = await http.post("/refresh");
        localStorage.setItem("jwt", data.access_token);
        if (err.config) {
          const headers = err.config.headers instanceof AxiosHeaders 
            ? err.config.headers 
            : new AxiosHeaders(err.config.headers);
          headers.set('Authorization', `Bearer ${data.access_token}`);
          err.config.headers = headers;
          return http(err.config);            // retry
        }
      } catch {
        localStorage.removeItem("jwt");
        window.location.replace("/");        // force login
      }
    }
    return Promise.reject(err);
  }
); 
