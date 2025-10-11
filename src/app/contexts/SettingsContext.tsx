"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SettingsContextType {
  componentScale: number;
  fontScale: number;
  setComponentScale: (scale: number) => void;
  setFontScale: (scale: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [componentScale, setComponentScaleState] = useState(1);
  const [fontScale, setFontScaleState] = useState(1);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedComponentScale = localStorage.getItem("componentScale");
    const savedFontScale = localStorage.getItem("fontScale");

    if (savedComponentScale) {
      setComponentScaleState(parseFloat(savedComponentScale));
    }
    if (savedFontScale) {
      setFontScaleState(parseFloat(savedFontScale));
    }
  }, []);

  // Apply settings to CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty("--component-scale", componentScale.toString());
    document.documentElement.style.setProperty("--font-scale", fontScale.toString());
  }, [componentScale, fontScale]);

  const setComponentScale = (scale: number) => {
    setComponentScaleState(scale);
    localStorage.setItem("componentScale", scale.toString());
  };

  const setFontScale = (scale: number) => {
    setFontScaleState(scale);
    localStorage.setItem("fontScale", scale.toString());
  };

  return (
    <SettingsContext.Provider
      value={{
        componentScale,
        fontScale,
        setComponentScale,
        setFontScale,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
