"use client";
import { useEffect } from "react";
import { useSettingsContext } from "./SettingsProvider";

export default function ForceLightMode() {
  const { settings } = useSettingsContext();
  const { userPreferences } = settings;

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme based on settings
    if (userPreferences.theme === 'dark') {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.background = "#1a1a1a";
    } else if (userPreferences.theme === 'light') {
      root.classList.add("light");
      root.classList.remove("dark");
      root.style.background = "#fff";
    } else {
      // Auto theme - check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add("dark");
        root.classList.remove("light");
        root.style.background = "#1a1a1a";
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
        root.style.background = "#fff";
      }
    }
  }, [userPreferences.theme]);

  return null;
} 