const STORAGE_KEY = 'tm_token';

let token = null;
let onUnauthorized = null;

export const getToken = () => {
  if (token) {
    return token;
  }

  try {
    const storedToken = localStorage.getItem(STORAGE_KEY);

    if (storedToken) {
      token = storedToken;
    }

    return token;
  } catch (error) {
    console.error('Failed to read token:', error);
    return null;
  }
};

export const setToken = (value) => {
  token = value || null;

  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to store token:', error);
  }
};

export const clearToken = () => {
  token = null;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to remove token:', error);
  }
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized =
    typeof handler === 'function'
      ? handler
      : null;
};

export const handleUnauthorized = () => {
  clearToken();

  if (onUnauthorized) {
    onUnauthorized();
  }
};

export const initAuthToken = () => {
  return getToken();
};