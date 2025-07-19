import { useState, useEffect, useCallback } from 'react';
import SettingsService, { 
  AppSettings, 
  CompanySettings, 
  InvoiceSettings, 
  UserPreferences, 
  SystemSettings 
} from '../services/settingsService';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(SettingsService.getInstance().getSettings());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = SettingsService.getInstance().subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const updateCompanySettings = useCallback(async (updates: Partial<CompanySettings>) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().updateCompanySettings(updates);
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateInvoiceSettings = useCallback(async (updates: Partial<InvoiceSettings>) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().updateInvoiceSettings(updates);
    } catch (error) {
      console.error('Error updating invoice settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUserPreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().updateUserPreferences(updates);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSystemSettings = useCallback(async (updates: Partial<SystemSettings>) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().updateSystemSettings(updates);
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAllSettings = useCallback(async (newSettings: AppSettings) => {
    setIsLoading(true);
    try {
      await SettingsService.getInstance().saveAllSettings(newSettings);
    } catch (error) {
      console.error('Error saving all settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportSettings = useCallback(() => {
    return SettingsService.getInstance().exportSettings();
  }, []);

  const importSettings = useCallback((jsonString: string) => {
    try {
      SettingsService.getInstance().importSettings(jsonString);
    } catch (error) {
      console.error('Error importing settings:', error);
      throw error;
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    SettingsService.getInstance().resetToDefaults();
  }, []);

  // Utility methods
  const formatCurrency = useCallback((amount: number): string => {
    return SettingsService.getInstance().formatCurrency(amount);
  }, []);

  const formatDate = useCallback((date: Date): string => {
    return SettingsService.getInstance().formatDate(date);
  }, []);

  const generateInvoiceNumber = useCallback(async (): Promise<string> => {
    return await SettingsService.getInstance().generateInvoiceNumber();
  }, []);

  return {
    settings,
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
    // Direct access to settings
    companySettings: settings.companySettings,
    invoiceSettings: settings.invoiceSettings,
    userPreferences: settings.userPreferences,
    systemSettings: settings.systemSettings
  };
} 