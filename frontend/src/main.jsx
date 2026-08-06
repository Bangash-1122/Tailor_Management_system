import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App";

// Prevent flash of dark mode by setting theme before React mounts
const LOCAL_STORAGE_KEY = 'tailor_pro_theme';
try {
  const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }
} catch (err) {
  // Fallback if localStorage is inaccessible
  console.error('Failed to restore theme:', err);
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
            <App />
    </React.StrictMode>
);
