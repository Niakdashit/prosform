import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ThemeSettings {
  // Typography
  fontFamily: string;
  fontSize: number;
  
  // Colors
  textColor: string;
  backgroundColor: string;
  buttonColor: string;
  systemColor: string;
  accentColor: string;
  
  // Buttons
  buttonStyle: 'square' | 'rounded' | 'pill';
  buttonSize: 'small' | 'medium' | 'large';
  
  // Borders
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  
  // Spacing
  questionSpacing: number;
  inputPadding: number;
  pageMargins: number;
  
  // Effects
  shadowIntensity: number;
  animationSpeed: 'none' | 'slow' | 'normal' | 'fast';
}

export const defaultTheme: ThemeSettings = {
  fontFamily: 'inter',
  fontSize: 16,
  textColor: '#ffffff',
  backgroundColor: '#4a4138',
  buttonColor: '#ffffff',
  systemColor: '#f5ca3c',
  accentColor: '#f9c31f',
  buttonStyle: 'rounded',
  buttonSize: 'medium',
  borderColor: '#4A4138',
  borderWidth: 1,
  borderRadius: 8,
  questionSpacing: 1,
  inputPadding: 12,
  pageMargins: 32,
  shadowIntensity: 20,
  animationSpeed: 'normal',
};

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
