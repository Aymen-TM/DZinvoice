'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { AppSettings } from '../services/settingsService';

interface SettingsContextType {
  settings: AppSettings;
  isLoading: boolean;
  updateCompanySettings: (updates: any) => Promise<void>;
  updateInvoiceSettings: (updates: any) => Promise<void>;
  updateUserPreferences: (updates: any) => Promise<void>;
  updateSystemSettings: (updates: any) => Promise<void>;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  generateInvoiceNumber: () => Promise<string>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}

interface SettingsProviderProps {
  children: React.ReactNode;
}

export default function SettingsProvider({ children }: SettingsProviderProps) {
  const settingsHook = useSettings();

  // Apply theme changes immediately
  useEffect(() => {
    const { userPreferences } = settingsHook.settings;
    const root = document.documentElement;
    
    if (userPreferences.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (userPreferences.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // Auto theme - check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [settingsHook.settings, settingsHook.settings.userPreferences.theme]);

  // Apply language changes
  useEffect(() => {
    const { userPreferences } = settingsHook.settings;
    document.documentElement.lang = userPreferences.language;
  }, [settingsHook.settings, settingsHook.settings.userPreferences.language]);

  // Apply timezone changes
  useEffect(() => {
    const { userPreferences } = settingsHook.settings;
    // Set timezone for date formatting
    if (userPreferences.timezone && typeof window !== 'undefined' && window.localStorage) {
      // This will be used by date formatting functions
      localStorage.setItem('userTimezone', userPreferences.timezone);
    }
  }, [settingsHook.settings, settingsHook.settings.userPreferences.timezone]);

  // Apply date format changes
  useEffect(() => {
    const { userPreferences } = settingsHook.settings;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('dateFormat', userPreferences.dateFormat);
    }
  }, [settingsHook.settings, settingsHook.settings.userPreferences.dateFormat]);

  // Apply notification settings
  useEffect(() => {
    const { userPreferences } = settingsHook.settings;
    if (userPreferences.notifications.browser && typeof window !== 'undefined' && 'Notification' in window) {
      // Request notification permission if not already granted
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settingsHook.settings, settingsHook.settings.userPreferences.notifications]);

  // Apply session timeout
  useEffect(() => {
    const { systemSettings } = settingsHook.settings;
    if (systemSettings.sessionTimeout > 0) {
      // Set up session timeout
      const timeoutMs = systemSettings.sessionTimeout * 60 * 1000; // Convert minutes to milliseconds
      const timeoutId = setTimeout(() => {
        // Auto logout after session timeout
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.clear();
        }
        window.location.href = '/';
      }, timeoutMs);

      return () => clearTimeout(timeoutId);
    }
  }, [settingsHook.settings, settingsHook.settings.systemSettings.sessionTimeout]);

  // Apply auto-save setting
  useEffect(() => {
    const { systemSettings } = settingsHook.settings;
    if (systemSettings.autoSave) {
      // Set up auto-save functionality
      const autoSaveInterval = setInterval(() => {
        // Auto-save logic here
        console.log('Auto-saving...');
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(autoSaveInterval);
    }
  }, [settingsHook.settings, settingsHook.settings.systemSettings.autoSave]);

  return (
    <SettingsContext.Provider value={settingsHook}>
      {children}
    </SettingsContext.Provider>
  );
} 