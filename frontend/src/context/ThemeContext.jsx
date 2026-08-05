import { createContext, useContext, useEffect, useState } from 'react';
import { Moon, Sun, Sparkles, Droplets, Leaf, Flame, Heart, Compass } from 'lucide-react';

export const THEMES = [
  {
    id: 'dark',
    name: 'Dark Theme',
    description: 'Sleek dark interface (Default)',
    icon: Moon,
    primaryColor: '#6366f1',
    bgPreview: '#0a0f1e',
    cardPreview: '#0f1629',
    accentPreview: '#6366f1',
    isDark: true,
  },
  {
    id: 'light-purple',
    name: 'Light Purple',
    description: 'Modern light theme with purple accent',
    icon: Sun,
    primaryColor: '#6D5DF6',
    bgPreview: '#F6F7FB',
    cardPreview: '#FFFFFF',
    accentPreview: '#6D5DF6',
    isDark: false,
  },
  {
    id: 'light-blue',
    name: 'Light Blue',
    description: 'Clean light theme with ocean blue accent',
    icon: Droplets,
    primaryColor: '#2563EB',
    bgPreview: '#F6F7FB',
    cardPreview: '#FFFFFF',
    accentPreview: '#2563EB',
    isDark: false,
  },
  {
    id: 'light-green',
    name: 'Light Green',
    description: 'Fresh light theme with emerald green accent',
    icon: Leaf,
    primaryColor: '#10B981',
    bgPreview: '#F6F7FB',
    cardPreview: '#FFFFFF',
    accentPreview: '#10B981',
    isDark: false,
  },
  {
    id: 'light-orange',
    name: 'Light Orange',
    description: 'Warm light theme with amber orange accent',
    icon: Flame,
    primaryColor: '#F59E0B',
    bgPreview: '#F6F7FB',
    cardPreview: '#FFFFFF',
    accentPreview: '#F59E0B',
    isDark: false,
  },
  {
    id: 'light-pink',
    name: 'Light Pink',
    description: 'Soft light theme with rose pink accent',
    icon: Heart,
    primaryColor: '#EC4899',
    bgPreview: '#F6F7FB',
    cardPreview: '#FFFFFF',
    accentPreview: '#EC4899',
    isDark: false,
  },
  {
    id: 'light-teal',
    name: 'Light Teal',
    description: 'Vibrant light theme with turquoise teal accent',
    icon: Compass,
    primaryColor: '#14B8A6',
    bgPreview: '#F6F7FB',
    cardPreview: '#FFFFFF',
    accentPreview: '#14B8A6',
    isDark: false,
  },
];

const LOCAL_STORAGE_KEY = 'tailor_pro_theme';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  currentThemeObj: THEMES[0],
  themes: THEMES,
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
        return savedTheme;
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
    return 'dark';
  });

  const setTheme = (newTheme) => {
    if (THEMES.some((t) => t.id === newTheme)) {
      setThemeState(newTheme);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, newTheme);
      } catch (err) {
        console.error('Failed to save theme preference:', err);
      }
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const currentThemeObj = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentThemeObj, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
