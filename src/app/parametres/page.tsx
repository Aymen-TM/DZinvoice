"use client";

import React, { useState } from 'react';
import { 
  FiSettings, 
  FiUser, 
  FiHome, 
  FiFileText, 
  FiShield, 
  FiDatabase,
  FiSave,
  FiCheck,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiTrash2,
  FiRefreshCw,
  FiAlertTriangle
} from 'react-icons/fi';
import { useSettings } from '../../hooks/useSettings';
import Image from 'next/image';

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    settings,
    isLoading,
    updateCompanySettings,
    updateInvoiceSettings,
    updateUserPreferences,
    updateSystemSettings,
    exportSettings,
    importSettings,
    resetToDefaults
  } = useSettings();

  const { companySettings, invoiceSettings, userPreferences, systemSettings } = settings;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveSettings = async (settingsType: string, data: any) => {
    try {
      switch (settingsType) {
        case 'companySettings':
          await updateCompanySettings(data);
          break;
        case 'invoiceSettings':
          await updateInvoiceSettings(data);
          break;
        case 'userPreferences':
          await updateUserPreferences(data);
          break;
        case 'systemSettings':
          await updateSystemSettings(data);
          break;
      }
      
      setMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès!' });
      setIsEditing(false);
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateCompanySettings({
          ...companySettings,
          logo: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportSettings = () => {
    const settingsJson = exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dzinvoice-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          importSettings(e.target?.result as string);
          setMessage({ type: 'success', text: 'Paramètres importés avec succès!' });
        } catch {
          setMessage({ type: 'error', text: 'Erreur lors de l\'import' });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres?')) {
      resetToDefaults();
      setMessage({ type: 'success', text: 'Paramètres réinitialisés!' });
    }
  };

  const tabs = [
    { id: 'company', name: 'Entreprise', icon: FiHome },
    { id: 'invoice', name: 'Facturation', icon: FiFileText },
    { id: 'user', name: 'Préférences', icon: FiUser },
    { id: 'system', name: 'Système', icon: FiSettings },
    { id: 'security', name: 'Sécurité', icon: FiShield },
    { id: 'backup', name: 'Sauvegarde', icon: FiDatabase }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
          <p className="text-gray-600">Gérez les paramètres de votre application</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? <FiCheck className="mr-2" /> : <FiAlertTriangle className="mr-2" />}
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Informations de l&apos;entreprise</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FiEdit3 className="mr-2" />
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo Upload */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo de l&apos;entreprise</label>
                    <div className="flex items-center space-x-4">
                      {companySettings.logo && (
                        <Image
                          src={companySettings.logo}
                          alt="Logo"
                          width={80}
                          height={80}
                          className="w-20 h-20 object-contain border rounded-lg"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={!isEditing}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l&apos;entreprise</label>
                    <input
                      type="text"
                      value={companySettings.name}
                      onChange={(e) => updateCompanySettings({...companySettings, name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                    <input
                      type="text"
                      value={companySettings.address}
                      onChange={(e) => updateCompanySettings({...companySettings, address: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={companySettings.phone}
                      onChange={(e) => updateCompanySettings({...companySettings, phone: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => updateCompanySettings({...companySettings, email: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                    <input
                      type="url"
                      value={companySettings.website}
                      onChange={(e) => updateCompanySettings({...companySettings, website: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de TVA</label>
                    <input
                      type="text"
                      value={companySettings.taxNumber}
                      onChange={(e) => updateCompanySettings({...companySettings, taxNumber: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => saveSettings('companySettings', companySettings)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiSave className="mr-2" />}
                      Sauvegarder
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoice' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Paramètres de facturation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Devise par défaut</label>
                    <select
                      value={invoiceSettings.defaultCurrency}
                      onChange={(e) => updateInvoiceSettings({...invoiceSettings, defaultCurrency: e.target.value as string})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="DA">Dinar Algérien (DA)</option>
                      <option value="EUR">Euro (EUR)</option>
                      <option value="USD">Dollar US (USD)</option>
                      <option value="MAD">Dirham Marocain (MAD)</option>
                      <option value="TND">Dinar Tunisien (TND)</option>
                      <option value="XOF">Franc CFA (XOF)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Taux de TVA (%)</label>
                    <input
                      type="number"
                      value={invoiceSettings.taxRate}
                      onChange={(e) => updateInvoiceSettings({...invoiceSettings, taxRate: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conditions de paiement</label>
                    <input
                      type="text"
                      value={invoiceSettings.paymentTerms}
                      onChange={(e) => updateInvoiceSettings({...invoiceSettings, paymentTerms: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Préfixe des factures</label>
                    <input
                      type="text"
                      value={invoiceSettings.invoicePrefix}
                      onChange={(e) => updateInvoiceSettings({...invoiceSettings, invoicePrefix: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={invoiceSettings.autoNumbering}
                        onChange={(e) => updateInvoiceSettings({...invoiceSettings, autoNumbering: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Numérotation automatique des factures</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Langue par défaut</label>
                    <select
                      value={invoiceSettings.defaultLanguage}
                      onChange={(e) => updateInvoiceSettings({...invoiceSettings, defaultLanguage: e.target.value as string})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية (Arabe)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => saveSettings('invoiceSettings', invoiceSettings)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiSave className="mr-2" />}
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'user' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Préférences utilisateur</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
                    <select
                      value={userPreferences.theme}
                      onChange={(e) => updateUserPreferences({...userPreferences, theme: e.target.value as 'light' | 'dark' | 'auto'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="light">Clair</option>
                      <option value="dark">Sombre</option>
                      <option value="auto">Automatique</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                    <select
                      value={userPreferences.language}
                      onChange={(e) => updateUserPreferences({...userPreferences, language: e.target.value as string})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="fr">Français</option>
                      <option value="ar">العربية (Arabe)</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                    <select
                      value={userPreferences.timezone}
                      onChange={(e) => updateUserPreferences({...userPreferences, timezone: e.target.value as string})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Africa/Algiers">Algérie (UTC+1)</option>
                      <option value="Africa/Casablanca">Maroc (UTC+0/+1)</option>
                      <option value="Africa/Tunis">Tunisie (UTC+1)</option>
                      <option value="Africa/Dakar">Sénégal (UTC+0)</option>
                      <option value="Africa/Abidjan">Côte d&apos;Ivoire (UTC+0)</option>
                      <option value="Europe/Paris">France (UTC+1/+2)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Format de date</label>
                    <select
                      value={userPreferences.dateFormat}
                      onChange={(e) => updateUserPreferences({...userPreferences, dateFormat: e.target.value as string})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userPreferences.notifications.email}
                        onChange={(e) => updateUserPreferences({
                          ...userPreferences, 
                          notifications: {...userPreferences.notifications, email: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Notifications par email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userPreferences.notifications.browser}
                        onChange={(e) => updateUserPreferences({
                          ...userPreferences, 
                          notifications: {...userPreferences.notifications, browser: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Notifications navigateur</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={userPreferences.notifications.sound}
                        onChange={(e) => updateUserPreferences({
                          ...userPreferences, 
                          notifications: {...userPreferences.notifications, sound: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Sons de notification</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => saveSettings('userPreferences', userPreferences)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiSave className="mr-2" />}
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Paramètres système</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence de sauvegarde</label>
                    <select
                      value={systemSettings.backupFrequency}
                      onChange={(e) => updateSystemSettings({...systemSettings, backupFrequency: e.target.value as string})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Quotidienne</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuelle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rétention des données (jours)</label>
                    <input
                      type="number"
                      value={systemSettings.dataRetention}
                      onChange={(e) => updateSystemSettings({...systemSettings, dataRetention: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timeout de session (minutes)</label>
                    <input
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => updateSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={systemSettings.autoSave}
                        onChange={(e) => updateSystemSettings({...systemSettings, autoSave: e.target.checked})}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Sauvegarde automatique</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => saveSettings('systemSettings', systemSettings)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? <FiRefreshCw className="animate-spin" /> : <FiSave className="mr-2" />}
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Sécurité</h3>
                
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                      <FiAlertTriangle className="text-yellow-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Changement de mot de passe</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Assurez-vous de choisir un mot de passe fort et unique.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe actuel</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <FiEyeOff className="text-gray-400" /> : <FiEye className="text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nouveau mot de passe</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le nouveau mot de passe</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (newPassword !== confirmPassword) {
                          setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
                          return;
                        }
                        if (newPassword.length < 8) {
                          setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
                          return;
                        }
                        setMessage({ type: 'success', text: 'Mot de passe changé avec succès!' });
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Changer le mot de passe
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Sauvegarde et restauration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Exporter les paramètres</h4>
                    <p className="text-sm text-blue-700 mb-4">
                      Sauvegardez vos paramètres actuels dans un fichier JSON.
                    </p>
                    <button
                      onClick={handleExportSettings}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <FiDownload className="mr-2" />
                      Exporter
                    </button>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Importer les paramètres</h4>
                    <p className="text-sm text-green-700 mb-4">
                      Restaurez vos paramètres à partir d&apos;un fichier JSON.
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportSettings}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Réinitialiser les paramètres</h4>
                  <p className="text-sm text-red-700 mb-4">
                    Attention : Cette action réinitialisera tous les paramètres aux valeurs par défaut.
                  </p>
                  <button
                    onClick={handleResetSettings}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <FiTrash2 className="mr-2" />
                    Réinitialiser
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 