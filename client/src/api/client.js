import axios from "axios";
import { API_BASE } from "./config";

// Access tokens live in memory only — never localStorage.
// Staff token goes to sessionStorage (8 h lifetime, tab-scoped is acceptable).
let _accessToken = null;
let _staffToken = null;

export function setAccessToken(token) { _accessToken = token; }
export function setStaffToken(token) {
  _staffToken = token;
  if (token) sessionStorage.setItem("yulo_staff_token", token);
  else sessionStorage.removeItem("yulo_staff_token");
}
export function getAccessToken() { return _accessToken; }
export function getStaffToken() {
  if (!_staffToken) _staffToken = sessionStorage.getItem("yulo_staff_token");
  return _staffToken;
}

// Single Axios instance for all API calls.
const client = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

// ── Request interceptor ─────────────────────────────────────────────────────
// Attach whichever token is appropriate. Staff routes set config._staff = true.
client.interceptors.request.use((config) => {
  const token = config._staff ? getStaffToken() : getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — auto-refresh for owner/customer tokens ───────────
let _refreshing = false;
let _queue = [];

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const code = err.response?.data?.code;

    // Only auto-refresh owner/customer access tokens, not staff tokens.
    if (code === "TOKEN_EXPIRED" && !original._retried && !original._staff) {
      original._retried = true;

      if (_refreshing) {
        return new Promise((resolve, reject) => _queue.push({ resolve, reject }))
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return client(original);
          });
      }

      _refreshing = true;
      try {
        const { data } = await axios.post(
          `${API_BASE}/api/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        _queue.forEach(({ resolve }) => resolve(newToken));
        _queue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (refreshErr) {
        setAccessToken(null);
        _queue.forEach(({ reject }) => reject(refreshErr));
        _queue = [];
        return Promise.reject(refreshErr);
      } finally {
        _refreshing = false;
      }
    }

    // Unwrap Axios error so callers get a plain Error with the API message.
    const message = err.response?.data?.message ?? err.message ?? "Request failed";
    const apiError = new Error(message);
    apiError.code = code;
    apiError.status = err.response?.status;
    apiError.details = err.response?.data?.details;
    return Promise.reject(apiError);
  },
);

export default client;
