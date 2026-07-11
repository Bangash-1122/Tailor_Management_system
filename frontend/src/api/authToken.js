const STORAGE_KEY = 'tm_token';
let token = null;
let onUnauthorized = null;

export const getToken = () => {
  if (token) return token;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) token = stored;
    return token;
  } catch {
    return token;
  }
};

export const setToken = (value) => {
  token = value;
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const clearToken = () => {
  token = null;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export const handleUnauthorized = () => {
  clearToken();
  onUnauthorized?.();
};

export const initAuthToken = () => {
  getToken();
};
