import { useState, useEffect, useCallback } from 'react';
import SettingsService, { 
  AppSettings, 
  CompanySettings, 
  InvoiceSettings, 
  UserPreferences, 
  SystemSettings 
} from '../services/settingsService';

const defaultSettings: AppSettings = {
  companySettings: {
    name: '', address: '', phone: '', email: '', website: '', taxNumber: '', logo: ''
  },
  invoiceSettings: {
    defaultCurrency: 'DZD', taxRate: 19, paymentTerms: '', invoicePrefix: '', autoNumbering: true, defaultLanguage: 'fr'
  },
  userPreferences: {
    theme: 'light', language: 'fr', timezone: '', dateFormat: 'DD/MM/YYYY', notifications: { email: true, browser: true, sound: false }
  },
  systemSettings: {
    backupFrequency: 'daily', dataRetention: 365, autoSave: true, sessionTimeout: 30
  }
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      const loaded = await SettingsService.getInstance().getSettingsAsync();
      if (mounted) {
        setSettings(loaded);
        setIsLoading(false);
      }
    }
    load();
    // Subscribe to changes
    const unsubscribe = SettingsService.getInstance().subscribe(async () => {
      const loaded = await SettingsService.getInstance().getSettingsAsync();
      setSettings(loaded);
    });
    return () => { mounted = false; unsubscribe(); };
  }, []);

  const updateCompanySettings = useCallback(async (updates: Partial<CompanySettings>) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().updateCompanySettings(updates);
      const loaded = await SettingsService.getInstance().getSettingsAsync();
      setSettings(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateInvoiceSettings = useCallback(async (updates: Partial<InvoiceSettings>) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().updateInvoiceSettings(updates);
      const loaded = await SettingsService.getInstance().getSettingsAsync();
      setSettings(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserPreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().updateUserPreferences(updates);
      const loaded = await SettingsService.getInstance().getSettingsAsync();
      setSettings(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSystemSettings = useCallback(async (updates: Partial<SystemSettings>) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().updateSystemSettings(updates);
      const loaded = await SettingsService.getInstance().getSettingsAsync();
      setSettings(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAllSettings = useCallback(async (newSettings: AppSettings) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().saveAllSettings(newSettings);
      const loaded = await SettingsService.getInstance().getSettingsAsync();
      setSettings(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportSettings = useCallback(async () => {
    return await SettingsService.getInstance().exportSettingsAsync();
  }, []);

  const importSettings = useCallback(async (jsonString: string) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().importSettingsAsync(jsonString);
      const loaded = await SettingsService.getInstance().getSettingsAsync();
      setSettings(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetToDefaults = useCallback(async () => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().resetToDefaultsAsync();
      const loaded = await SettingsService.getInstance().getSettingsAsync();
      setSettings(loaded);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Utility methods
  const formatCurrency = useCallback(async (amount: number): Promise<string> => {
    return await SettingsService.getInstance().formatCurrency(amount);
  }, []);

  const formatDate = useCallback(async (date: Date): Promise<string> => {
    return await SettingsService.getInstance().formatDate(date);
  }, []);

  const generateInvoiceNumber = useCallback(async (): Promise<string> => {
    return await SettingsService.getInstance().generateInvoiceNumber();
  }, []);

  return {
    settings: settings || defaultSettings,
    isLoading,
    updateCompanySettings,
    updateInvoiceSettings,
    updateUserPreferences,
    updateSystemSettings,
    saveAllSettings,
    exportSettings,
    importSettings,
    resetToDefaults,
    formatCurrency,
    formatDate,
    generateInvoiceNumber,
    // Direct access to settings (may be undefined until loaded)
    companySettings: (settings || defaultSettings).companySettings,
    invoiceSettings: (settings || defaultSettings).invoiceSettings,
    userPreferences: (settings || defaultSettings).userPreferences,
    systemSettings: (settings || defaultSettings).systemSettings
  };
} 