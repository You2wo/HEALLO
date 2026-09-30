"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Theme = 'light' | 'dark';

interface SettingsContextType {
  fontScale: number;
  setFontScale: (scale: number) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Runs before first paint so the saved theme and font size never flash.
// Light is the default; dark applies only once the user picks it.
export const settingsBootScript = `(function(){try{var d=document.documentElement;d.dataset.theme=localStorage.getItem('theme')==='dark'?'dark':'light';var f=parseFloat(localStorage.getItem('fontScale'));if(f>=0.8&&f<=1.4){d.style.setProperty('--font-scale',f)}}catch(e){}})()`;

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontScale, setFontScaleState] = useState(1);
  const [theme, setThemeState] = useState<Theme>('light');

  // Pick up what the boot script already applied.
  useEffect(() => {
    const root = document.documentElement;
    setThemeState(root.dataset.theme === 'dark' ? 'dark' : 'light');
    const saved = parseFloat(root.style.getPropertyValue('--font-scale'));
    if (saved) setFontScaleState(saved);
  }, []);

  const setFontScale = useCallback((scale: number) => {
    setFontScaleState(scale);
    document.documentElement.style.setProperty('--font-scale', scale.toString());
    localStorage.setItem('fontScale', scale.toString());
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  }, []);

  const value = useMemo(
    () => ({ fontScale, setFontScale, theme, setTheme }),
    [fontScale, setFontScale, theme, setTheme]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
