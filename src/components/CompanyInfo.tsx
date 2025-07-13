'use client';

import { Company } from '@/types/invoice';

interface CompanyInfoProps {
  company: Company;
  onCompanyChange: (company: Company) => void;
}

export default function CompanyInfo({ company, onCompanyChange }: CompanyInfoProps) {
  const handleChange = (field: keyof Company, value: string) => {
    onCompanyChange({
      ...company,
      [field]: value,
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-500 group">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">Informations de l&apos;entreprise</h2>
          <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Renseignez les détails de votre entreprise</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            Nom de l&apos;entreprise *
          </label>
          <input
            type="text"
            value={company.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="Nom de l&apos;entreprise"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            Activité
          </label>
          <input
            type="text"
            value={company.activity}
            onChange={(e) => handleChange('activity', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="Activité"
          />
        </div>

        <div className="sm:col-span-2 space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            Adresse
          </label>
          <input
            type="text"
            value={company.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="Adresse complète"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            Capital
          </label>
          <input
            type="text"
            value={company.capital}
            onChange={(e) => handleChange('capital', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="Capital"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            Téléphone
          </label>
          <input
            type="tel"
            value={company.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="Téléphone"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            Email
          </label>
          <input
            type="email"
            value={company.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="Email"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            Site web
          </label>
          <input
            type="url"
            value={company.web}
            onChange={(e) => handleChange('web', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="Site web"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            Banque
          </label>
          <input
            type="text"
            value={company.bank}
            onChange={(e) => handleChange('bank', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="Banque"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            RC
          </label>
          <input
            type="text"
            value={company.rc}
            onChange={(e) => handleChange('rc', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="RC"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            NIF
          </label>
          <input
            type="text"
            value={company.nif}
            onChange={(e) => handleChange('nif', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="NIF"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            AI
          </label>
          <input
            type="text"
            value={company.ai}
            onChange={(e) => handleChange('ai', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="AI"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            NIS
          </label>
          <input
            type="text"
            value={company.nis}
            onChange={(e) => handleChange('nis', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="NIS"
          />
        </div>
      </div>
    </div>
  );
} 