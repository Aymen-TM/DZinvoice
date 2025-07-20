import localforage from 'localforage';

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
  logo: string;
}

export interface InvoiceSettings {
  defaultCurrency: string;
  taxRate: number;
  paymentTerms: string;
  invoicePrefix: string;
  autoNumbering: boolean;
  defaultLanguage: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    browser: boolean;
    sound: boolean;
  };
}

export interface SystemSettings {
  backupFrequency: string;
  dataRetention: number;
  autoSave: boolean;
  sessionTimeout: number;
}

export interface AppSettings {
  companySettings: CompanySettings;
  invoiceSettings: InvoiceSettings;
  userPreferences: UserPreferences;
  systemSettings: SystemSettings;
}

class SettingsService {
  private static instance: SettingsService;
  private listeners: ((settings: AppSettings) => void)[] = [];

  private defaultSettings: AppSettings = {
    companySettings: {
      name: 'Votre Entreprise SARL',
      address: '123 Rue Didouche Mourad, Alger 16000',
      phone: '+213 21 123 456',
      email: 'contact@votreentreprise.dz',
      website: 'www.votreentreprise.dz',
      taxNumber: '123456789',
      logo: ''
    },
    invoiceSettings: {
      defaultCurrency: 'DZD', // Code ISO officiel requis par Intl.NumberFormat
      taxRate: 19,
      paymentTerms: '30 jours',
      invoicePrefix: 'FV/25',
      autoNumbering: true,
      defaultLanguage: 'fr'
    },
    userPreferences: {
      theme: 'light',
      language: 'fr',
      timezone: 'Africa/Algiers',
      dateFormat: 'DD/MM/YYYY',
      notifications: {
        email: true,
        browser: true,
        sound: false
      }
    },
    systemSettings: {
      backupFrequency: 'daily',
      dataRetention: 365,
      autoSave: true,
      sessionTimeout: 30
    }
  };

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private async loadSettingsAsync(): Promise<AppSettings> {
    // Migration: If settings exist in localStorage but not in localforage, migrate them
    if (typeof window !== 'undefined' && window.localStorage) {
      const localforageSettings = await localforage.getItem<AppSettings>('appSettings');
      if (!localforageSettings) {
        const localStorageSettings = localStorage.getItem('appSettings');
        if (localStorageSettings) {
          const parsed = JSON.parse(localStorageSettings);
          await localforage.setItem('appSettings', parsed);
          localStorage.removeItem('appSettings');
          return this.mergeWithDefaults(parsed);
        }
      } else {
        return this.mergeWithDefaults(localforageSettings);
      }
    }
    // If nothing found, use defaults
    return this.defaultSettings;
  }

  private mergeWithDefaults(saved: Partial<AppSettings>): AppSettings {
    return {
      companySettings: { ...this.defaultSettings.companySettings, ...saved.companySettings },
      invoiceSettings: { ...this.defaultSettings.invoiceSettings, ...saved.invoiceSettings },
      userPreferences: { ...this.defaultSettings.userPreferences, ...saved.userPreferences },
      systemSettings: { ...this.defaultSettings.systemSettings, ...saved.systemSettings }
    };
  }

  // Synchronous fallback for legacy code (returns default if not loaded yet)
  private loadSettings(): AppSettings {
    // This is only used for initial state; async version is used for all real ops
    return this.defaultSettings;
  }

  public async getSettingsAsync(): Promise<AppSettings> {
    return await this.loadSettingsAsync();
  }

  public async getCompanySettings(): Promise<CompanySettings> {
    const settings = await this.loadSettingsAsync();
    return settings.companySettings;
  }

  public async getInvoiceSettings(): Promise<InvoiceSettings> {
    const settings = await this.loadSettingsAsync();
    return settings.invoiceSettings;
  }

  public async getUserPreferences(): Promise<UserPreferences> {
    const settings = await this.loadSettingsAsync();
    return settings.userPreferences;
  }

  public async getSystemSettings(): Promise<SystemSettings> {
    const settings = await this.loadSettingsAsync();
    return settings.systemSettings;
  }

  public async updateCompanySettings(settings: Partial<CompanySettings>): Promise<void> {
    const current = await this.loadSettingsAsync();
    const updated = {
      ...current,
      companySettings: { ...current.companySettings, ...settings }
    };
    await this.saveSettingsAsync(updated);
  }

  public async updateInvoiceSettings(settings: Partial<InvoiceSettings>): Promise<void> {
    const current = await this.loadSettingsAsync();
    const updated = {
      ...current,
      invoiceSettings: { ...current.invoiceSettings, ...settings }
    };
    await this.saveSettingsAsync(updated);
  }

  public async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const current = await this.loadSettingsAsync();
    const updated = {
      ...current,
      userPreferences: { ...current.userPreferences, ...preferences }
    };
    await this.saveSettingsAsync(updated);
  }

  public async updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    const current = await this.loadSettingsAsync();
    const updated = {
      ...current,
      systemSettings: { ...current.systemSettings, ...settings }
    };
    await this.saveSettingsAsync(updated);
  }

  public async saveAllSettings(settings: AppSettings): Promise<void> {
    await this.saveSettingsAsync(settings);
  }

  private async saveSettingsAsync(settings: AppSettings): Promise<void> {
    try {
      await localforage.setItem('appSettings', settings);
      this.notifyListeners(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  public subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current settings
    listener(this.loadSettings());
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(settings: AppSettings): void {
    this.listeners.forEach(listener => listener(settings));
  }

  public async exportSettingsAsync(): Promise<string> {
    const settings = await this.loadSettingsAsync();
    return JSON.stringify(settings, null, 2);
  }

  public async importSettingsAsync(jsonString: string): Promise<void> {
    try {
      const settings = JSON.parse(jsonString);
      const merged = this.mergeWithDefaults(settings);
      await this.saveSettingsAsync(merged);
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Invalid settings file format');
    }
  }

  public async resetToDefaultsAsync(): Promise<void> {
    await this.saveSettingsAsync(this.defaultSettings);
  }

  // Utility methods for common settings
  public async getCurrency(): Promise<string> {
    const settings = await this.loadSettingsAsync();
    return settings.invoiceSettings.defaultCurrency;
  }

  public async getTaxRate(): Promise<number> {
    const settings = await this.loadSettingsAsync();
    return settings.invoiceSettings.taxRate;
  }

  public async getInvoicePrefix(): Promise<string> {
    const settings = await this.loadSettingsAsync();
    return settings.invoiceSettings.invoicePrefix;
  }

  public async getTheme(): Promise<'light' | 'dark' | 'auto'> {
    const settings = await this.loadSettingsAsync();
    return settings.userPreferences.theme;
  }

  public async getLanguage(): Promise<string> {
    const settings = await this.loadSettingsAsync();
    return settings.userPreferences.language;
  }

  public async getDateFormat(): Promise<string> {
    const settings = await this.loadSettingsAsync();
    return settings.userPreferences.dateFormat;
  }

  public async getTimezone(): Promise<string> {
    const settings = await this.loadSettingsAsync();
    return settings.userPreferences.timezone;
  }

  public async formatCurrency(amount: number): Promise<string> {
    const currency = await this.getCurrency();
    const locale = (await this.getLanguage()) === 'fr' ? 'fr-DZ' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  public async formatDate(date: Date): Promise<string> {
    const format = await this.getDateFormat();
    const locale = (await this.getLanguage()) === 'fr' ? 'fr-FR' : 'en-US';
    
    if (format === 'DD/MM/YYYY') {
      return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } else if (format === 'MM/DD/YYYY') {
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    } else {
      return date.toISOString().split('T')[0];
    }
  }

  public async generateInvoiceNumber(): Promise<string> {
    const prefix = await this.getInvoicePrefix();
    try {
      // Import the getCompleteInvoices function dynamically to avoid SSR issues
      const { getCompleteInvoices } = await import('@/utils/invoiceStorage');
      const invoices = await getCompleteInvoices();
      // Find the highest invoice number
      let maxNumber = 0;
      invoices.forEach(invoice => {
        const invoiceNumber = invoice.meta.invoiceNumber;
        if (invoiceNumber && invoiceNumber.startsWith(prefix)) {
          // Extract the number part after the prefix and dash
          const match = invoiceNumber.match(new RegExp(`^${prefix}-?(\\d+)$`));
          if (match) {
            const number = parseInt(match[1]);
            if (!isNaN(number) && number > maxNumber) {
              maxNumber = number;
            }
          }
        }
      });
      // Increment the highest number
      const nextNumber = maxNumber + 1;
      // Format with leading zeros (4 digits: 0001, 0002, etc.)
      const formattedNumber = nextNumber.toString().padStart(4, '0');
      return `${prefix}-${formattedNumber}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `${prefix}-${timestamp}${random}`;
    }
  }
}

export default SettingsService; 