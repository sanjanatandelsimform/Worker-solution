import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  /**
   * The class to add to the root element when the theme is dark
   * @default "dark-mode"
   */
  darkModeClass?: string;
  /**
   * The default theme to use if no theme is stored in localStorage
   * @default "system"
   */
  defaultTheme?: Theme;
  /**
   * The key to use to store the theme in localStorage
   * @default "ui-theme"
   */
  storageKey?: string;
}

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = 'ui-theme',
  darkModeClass = 'dark-mode',
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof globalThis.window !== 'undefined') {
      const savedTheme = globalThis.localStorage.getItem(
        storageKey
      ) as Theme | null;
      return savedTheme || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const applyTheme = () => {
      const root = globalThis.document.documentElement;

      if (theme === 'system') {
        const systemTheme = globalThis.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
          ? 'dark'
          : 'light';

        root.classList.toggle(darkModeClass, systemTheme === 'dark');
        globalThis.localStorage.removeItem(storageKey);
      } else {
        root.classList.toggle(darkModeClass, theme === 'dark');
        globalThis.localStorage.setItem(storageKey, theme);
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, storageKey, darkModeClass]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
