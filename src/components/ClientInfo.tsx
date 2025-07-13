'use client';

import { Client } from '@/types/invoice';

interface ClientInfoProps {
  client: Client;
  onClientChange: (client: Client) => void;
}

export default function ClientInfo({ client, onClientChange }: ClientInfoProps) {
  const handleChange = (field: keyof Client, value: string) => {
    onClientChange({
      ...client,
      [field]: value,
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-500 group">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">Informations du client</h2>
          <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Renseignez les détails de votre client</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-green-600 transition-colors duration-200">
            Nom du client *
          </label>
          <input
            type="text"
            value={client.clientName}
            onChange={(e) => handleChange('clientName', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-green-300 text-sm sm:text-base"
            placeholder="Nom du client"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-green-600 transition-colors duration-200">
            Code client
          </label>
          <input
            type="text"
            value={client.clientCode}
            onChange={(e) => handleChange('clientCode', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-green-300 text-sm sm:text-base"
            placeholder="Code client"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-green-600 transition-colors duration-200">
            Activité
          </label>
          <input
            type="text"
            value={client.activity}
            onChange={(e) => handleChange('activity', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-green-300 text-sm sm:text-base"
            placeholder="Activité"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-green-600 transition-colors duration-200">
            Ville
          </label>
          <input
            type="text"
            value={client.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-green-300 text-sm sm:text-base"
            placeholder="Ville"
          />
        </div>

        <div className="sm:col-span-2 space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-green-600 transition-colors duration-200">
            Adresse
          </label>
          <input
            type="text"
            value={client.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-green-300 text-sm sm:text-base"
            placeholder="Adresse complète"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-green-600 transition-colors duration-200">
            RC
          </label>
          <input
            type="text"
            value={client.rc}
            onChange={(e) => handleChange('rc', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-green-300 text-sm sm:text-base"
            placeholder="RC"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-green-600 transition-colors duration-200">
            NIF
          </label>
          <input
            type="text"
            value={client.nif}
            onChange={(e) => handleChange('nif', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-green-300 text-sm sm:text-base"
            placeholder="NIF"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-green-600 transition-colors duration-200">
            AI
          </label>
          <input
            type="text"
            value={client.ai}
            onChange={(e) => handleChange('ai', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-green-300 text-sm sm:text-base"
            placeholder="AI"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-green-600 transition-colors duration-200">
            NIS
          </label>
          <input
            type="text"
            value={client.nis}
            onChange={(e) => handleChange('nis', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-green-300 text-sm sm:text-base"
            placeholder="NIS"
          />
        </div>
      </div>
    </div>
  );
} 