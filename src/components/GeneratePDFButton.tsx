'use client';

import { useState } from 'react';
import type { InvoiceData } from '@/types/invoice';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

interface GeneratePDFButtonProps {
  invoiceData: InvoiceData;
}

export default function GeneratePDFButton({ invoiceData }: GeneratePDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await generateInvoicePDF(invoiceData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const isFormValid = () => {
    const { company, client, meta, items } = invoiceData;
    return (
      company.companyName.trim() !== '' &&
      client.clientName.trim() !== '' &&
      meta.invoiceNumber.trim() !== '' &&
      items.length > 0
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-8 left-8 w-1 h-1 bg-teal-400 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping delay-500"></div>
      </div>

      <div className="text-center relative z-10">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">Générer la facture</h2>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Créez votre facture au format PDF</p>
          </div>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleGeneratePDF}
            disabled={!isFormValid() || isGenerating}
            className={`
              w-full max-w-lg px-10 py-5 rounded-2xl font-semibold text-xl transition-all duration-500 transform hover:scale-105 active:scale-95 relative overflow-hidden
              ${isFormValid() && !isGenerating
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-2xl hover:shadow-emerald-500/25'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {/* Success animation overlay */}
            {showSuccess && (
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center animate-pulse">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white font-semibold">PDF généré avec succès!</span>
                </div>
              </div>
            )}

            {isGenerating ? (
              <div className="flex items-center justify-center space-x-4">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Génération en cours...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-4">
                <svg className="w-7 h-7 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Générer le PDF</span>
              </div>
            )}
          </button>

          {!isFormValid() && (
            <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-6 max-w-lg mx-auto animate-fade-in">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="font-semibold mb-1">Champs obligatoires manquants</p>
                  <p className="text-amber-700">Veuillez remplir tous les champs obligatoires pour générer le PDF</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 max-w-lg mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span>PDF professionnel</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
                <span>Téléchargement automatique</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-600"></div>
                <span>Calculs automatiques</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
} 