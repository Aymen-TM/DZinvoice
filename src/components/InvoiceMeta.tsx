'use client';

import { InvoiceMeta as InvoiceMetaType } from '@/types/invoice';
import { generateNextInvoiceNumber } from '@/utils/invoiceNumberGenerator';

interface InvoiceMetaProps {
  meta: InvoiceMetaType;
  onMetaChange: (meta: InvoiceMetaType) => void;
}

export default function InvoiceMeta({ meta, onMetaChange }: InvoiceMetaProps) {
  const handleChange = (field: keyof InvoiceMetaType, value: string) => {
    onMetaChange({
      ...meta,
      [field]: value,
    });
  };

  const handleRegenerateInvoiceNumber = async () => {
    const nextInvoiceNumber = await generateNextInvoiceNumber();
    onMetaChange({
      ...meta,
      invoiceNumber: nextInvoiceNumber,
    });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-500 group">
      <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">Métadonnées de la facture</h2>
          <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Informations générales de la facture</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-purple-600 transition-colors duration-200">
            Numéro de facture *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={meta.invoiceNumber}
              onChange={(e) => handleChange('invoiceNumber', e.target.value)}
              className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-purple-300 text-sm sm:text-base"
            />
            <button
              type="button"
              onClick={handleRegenerateInvoiceNumber}
              className="px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-semibold text-sm sm:text-base flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              title="Générer le prochain numéro"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-purple-600 transition-colors duration-200">
            Date de facture *
          </label>
          <input
            type="date"
            value={meta.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-purple-300 text-sm sm:text-base"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-purple-600 transition-colors duration-200">
            Conditions de paiement
          </label>
          <select
            value={meta.terms}
            onChange={(e) => handleChange('terms', e.target.value)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-purple-300 text-sm sm:text-base"
          >
            <option value="None">Aucune</option>
            <option value="30 days">30 jours</option>
            <option value="60 days">60 jours</option>
            <option value="90 days">90 jours</option>
            <option value="Immediate">Immédiat</option>
          </select>
        </div>

        <div className="sm:col-span-2 space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-purple-600 transition-colors duration-200">
            Notes
          </label>
          <textarea
            value={meta.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-purple-300 text-sm sm:text-base resize-none"
          />
        </div>
      </div>
    </div>
  );
} 