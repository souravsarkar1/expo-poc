import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightPalette, darkPalette } from './palette';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  palette: typeof lightPalette;
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  palette: lightPalette,
  toggleTheme: () => { },
});

interface Props {
  children: ReactNode;
}

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem('@app_theme');
        if (stored === 'light' || stored === 'dark') {
          setTheme(stored);
        } else {
          const colorScheme = Appearance.getColorScheme();
          setTheme(colorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (e) {
        console.warn('Failed to load theme', e);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    try {
      await AsyncStorage.setItem('@app_theme', newTheme);
    } catch (e) {
      console.warn('Failed to persist theme', e);
    }
    setTheme(newTheme);
  };

  const palette = theme === 'light' ? lightPalette : darkPalette;

  return (
    <ThemeContext.Provider value={{ theme, palette, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
