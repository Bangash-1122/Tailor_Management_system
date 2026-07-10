let token = null;
let onUnauthorized = null;

export const getToken = () => token;

export const setToken = (value) => {
  token = value;
};

export const clearToken = () => {
  token = null;
};

export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export const handleUnauthorized = () => {
  clearToken();
  onUnauthorized?.();
};
