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
      defaultCurrency: 'DA',
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

  private loadSettings(): AppSettings {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          // Merge with defaults to ensure all properties exist
          return this.mergeWithDefaults(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
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

  public getSettings(): AppSettings {
    return this.loadSettings();
  }

  public getCompanySettings(): CompanySettings {
    return this.loadSettings().companySettings;
  }

  public getInvoiceSettings(): InvoiceSettings {
    return this.loadSettings().invoiceSettings;
  }

  public getUserPreferences(): UserPreferences {
    return this.loadSettings().userPreferences;
  }

  public getSystemSettings(): SystemSettings {
    return this.loadSettings().systemSettings;
  }

  public async updateCompanySettings(settings: Partial<CompanySettings>): Promise<void> {
    const current = this.loadSettings();
    const updated = {
      ...current,
      companySettings: { ...current.companySettings, ...settings }
    };
    await this.saveSettings(updated);
  }

  public async updateInvoiceSettings(settings: Partial<InvoiceSettings>): Promise<void> {
    const current = this.loadSettings();
    const updated = {
      ...current,
      invoiceSettings: { ...current.invoiceSettings, ...settings }
    };
    await this.saveSettings(updated);
  }

  public async updateUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const current = this.loadSettings();
    const updated = {
      ...current,
      userPreferences: { ...current.userPreferences, ...preferences }
    };
    await this.saveSettings(updated);
  }

  public async updateSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    const current = this.loadSettings();
    const updated = {
      ...current,
      systemSettings: { ...current.systemSettings, ...settings }
    };
    await this.saveSettings(updated);
  }

  public async saveAllSettings(settings: AppSettings): Promise<void> {
    await this.saveSettings(settings);
  }

  private async saveSettings(settings: AppSettings): Promise<void> {
    try {
      // Check if we're in a browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('appSettings', JSON.stringify(settings));
        this.notifyListeners(settings);
      }
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

  public exportSettings(): string {
    const settings = this.loadSettings();
    return JSON.stringify(settings, null, 2);
  }

  public importSettings(jsonString: string): void {
    try {
      const settings = JSON.parse(jsonString);
      const merged = this.mergeWithDefaults(settings);
      this.saveSettings(merged);
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Invalid settings file format');
    }
  }

  public resetToDefaults(): void {
    this.saveSettings(this.defaultSettings);
  }

  // Utility methods for common settings
  public getCurrency(): string {
    return this.getInvoiceSettings().defaultCurrency;
  }

  public getTaxRate(): number {
    return this.getInvoiceSettings().taxRate;
  }

  public getInvoicePrefix(): string {
    return this.getInvoiceSettings().invoicePrefix;
  }

  public getTheme(): 'light' | 'dark' | 'auto' {
    return this.getUserPreferences().theme;
  }

  public getLanguage(): string {
    return this.getUserPreferences().language;
  }

  public getDateFormat(): string {
    return this.getUserPreferences().dateFormat;
  }

  public getTimezone(): string {
    return this.getUserPreferences().timezone;
  }

  public formatCurrency(amount: number): string {
    const currency = this.getCurrency();
    const locale = this.getLanguage() === 'fr' ? 'fr-DZ' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  public formatDate(date: Date): string {
    const format = this.getDateFormat();
    const locale = this.getLanguage() === 'fr' ? 'fr-FR' : 'en-US';
    
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
    const prefix = this.getInvoicePrefix();
    
    try {
      // Import the getCompleteInvoices function dynamically to avoid SSR issues
      const { getCompleteInvoices } = await import('@/utils/invoiceStorage');
      const invoices = await getCompleteInvoices();
      
      // Find the highest invoice number
      let maxNumber = 0;
      invoices.forEach(invoice => {
        const invoiceNumber = invoice.meta.invoiceNumber;
        if (invoiceNumber && invoiceNumber.startsWith(prefix)) {
          // Extract the number part after the prefix
          const numberPart = invoiceNumber.substring(prefix.length);
          const number = parseInt(numberPart);
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        }
      });
      
      // Increment the highest number
      const nextNumber = maxNumber + 1;
      
      // Format with leading zeros (4 digits: 0001, 0002, etc.)
      const formattedNumber = nextNumber.toString().padStart(4, '0');
      return `${prefix}${formattedNumber}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback to timestamp-based number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      return `${prefix}${timestamp}${random}`;
    }
  }
}

export default SettingsService; 