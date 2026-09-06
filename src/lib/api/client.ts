import axios from "axios";

/**
 * Axios instance for the (not-yet-implemented) MediLink FastAPI backend.
 * Until the backend exists, the service layer resolves mock data and only
 * uses this client through `tryBackend`.
 */
export const apiClient = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 4000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("medilink.token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Attempt a real backend call, fall back to mock data when unavailable. */
export async function tryBackend<T>(call: () => Promise<T>, fallback: () => Promise<T> | T): Promise<T> {
  try {
    return await call();
  } catch {
    return await fallback();
  }
}

export const delay = (ms = 320) => new Promise<void>((resolve) => setTimeout(resolve, ms));
