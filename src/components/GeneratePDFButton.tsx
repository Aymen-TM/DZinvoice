'use client';

import { useState } from 'react';
import type { InvoiceData } from '@/types/invoice';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import PreviewPDFButton from './PreviewPDFButton';
import { useRouter } from 'next/navigation';
import { addInvoice, getVentes, setVentes, addCompleteInvoice } from '@/utils/invoiceStorage';
import { getStock, setStock } from '@/utils/erpStorage';
import localforage from 'localforage';

interface GeneratePDFButtonProps {
  invoiceData: InvoiceData;
  isEditing?: boolean;
}

export default function GeneratePDFButton({ invoiceData, isEditing = false }: GeneratePDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setIsSuccess(false);
    setPdfBytes(null);
    setHasDownloaded(false);
    
    try {
      const bytes = await generateInvoicePDF(invoiceData);
      setPdfBytes(bytes);
      setIsSuccess(true);

      // Validate required fields
      if (!invoiceData.meta.invoiceNumber || invoiceData.meta.invoiceNumber.trim() === '') {
        alert('Le numéro de facture est obligatoire');
        return;
      }

      // Save invoice to localForage
      const invoiceToSave = {
        id: invoiceData.meta.invoiceNumber,
        clientName: invoiceData.client.clientName,
        date: invoiceData.meta.date,
        total: invoiceData.totals.montantTTC,
        items: invoiceData.items.map(item => ({
          description: item.designation,
          quantity: item.quantity,
          price: item.unitPrice,
        })),
      };
      await addInvoice(invoiceToSave);

      // Save complete invoice data for editing
      const completeInvoiceData = {
        id: invoiceData.meta.invoiceNumber,
        ...invoiceData,
      };
      await addCompleteInvoice(completeInvoiceData);
      // Update or add vente to ventes table
      const ventes = await getVentes();
      const updatedVente = {
        id: invoiceData.meta.invoiceNumber,
        client: invoiceData.client.clientName,
        date: invoiceData.meta.date,
        montant: invoiceData.totals.montantTTC,
        prixHT: invoiceData.totals.montantHT,
        nombreItems: invoiceData.items.length,
        unitPrice: invoiceData.items.length > 0 ? invoiceData.items[0].unitPrice : 0,
      };
      
      if (isEditing) {
        // Update existing vente
        const existingIndex = ventes.findIndex(v => v.id === invoiceData.meta.invoiceNumber);
        if (existingIndex !== -1) {
          ventes[existingIndex] = updatedVente;
          console.log("Updating existing vente:", updatedVente);
        } else {
          // If not found, add as new (fallback)
          ventes.push(updatedVente);
          console.log("Adding new vente (fallback):", updatedVente);
        }
      } else {
        // Add new vente
        ventes.push(updatedVente);
        console.log("Creating new vente:", updatedVente);
      }
      
      console.log("Invoice totals:", invoiceData.totals);
      console.log("Invoice items:", invoiceData.items);
      await setVentes(ventes);
      // Set highlight flag for Mes Factures
      await localforage.setItem('highlightInvoiceId', invoiceToSave.id);

      // --- Update stock after sale ---
      const stock = await getStock();
      const updatedStock = [...stock];
      invoiceData.items.forEach(item => {
        // Find by reference AND depot
        const idx = updatedStock.findIndex(s => s.ref === item.reference && s.depot === item.depot);
        if (idx !== -1) {
          updatedStock[idx] = {
            ...updatedStock[idx],
            quantite: Math.max(0, updatedStock[idx].quantite - item.quantity),
          };
        }
        // If not found, do nothing (can't sell what you don't have)
      });
      await setStock(updatedStock);
      // --- End update stock ---

      setShowSuccessModal(true);
      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBytes) return;
    
    try {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${invoiceData.meta.invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setHasDownloaded(true);
      
      // Show success modal after download
      setShowSuccessModal(true);
      // Reset download state after 3 seconds
      setTimeout(() => setHasDownloaded(false), 3000);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const handlePreview = () => {
    if (!pdfBytes || pdfBytes.length === 0) {
      alert('Aucun PDF disponible pour la prévisualisation');
      return;
    }
    try {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch {
      alert('Erreur lors de la prévisualisation du PDF');
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 hover:shadow-2xl transition-all duration-500 group">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
              {isEditing ? 'Mettre à jour le PDF' : 'Générer le PDF'}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
              {isEditing ? 'Mettez à jour votre facture au format PDF' : 'Créez votre facture au format PDF'}
            </p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Status indicators */}
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Prêt à générer</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
              <span>Format professionnel</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-600"></div>
              <span>Prévisualisation disponible</span>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              className={`
                relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl transition-all duration-500 font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 w-full sm:w-auto max-w-md
                ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}
                ${isSuccess ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : ''}
              `}
            >
              {/* Loading overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm sm:text-base">Génération en cours...</span>
                  </div>
                </div>
              )}

              {/* Success overlay */}
              {isSuccess && (
                <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base text-green-700 font-semibold">PDF généré avec succès!</span>
                  </div>
                </div>
              )}

              {/* Button content */}
              <div className="flex items-center justify-center space-x-3">
                <svg className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm sm:text-base">
                  {isGenerating ? 'Génération...' : isSuccess ? 'PDF créé!' : (isEditing ? 'Mettre à jour le PDF' : 'Générer le PDF')}
                </span>
              </div>
            </button>
          </div>

          {/* Action Buttons - Only show when PDF is generated */}
          {pdfBytes && (
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* Preview Button */}
              <PreviewPDFButton 
                pdfBytes={pdfBytes} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              />
              
              {/* Download Button */}
              <button
                onClick={handleDownload}
                className={`
                  bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 
                  text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold 
                  flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl 
                  transform hover:scale-105 active:scale-95 min-h-[48px]
                  ${hasDownloaded ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700' : ''}
                `}
              >
                {hasDownloaded ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Téléchargé!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Télécharger le PDF</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Additional info */}
          <div className="text-center space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              {pdfBytes ? 'Prévisualisez d\'abord, puis téléchargez si vous êtes satisfait' : 'Le PDF sera généré et vous pourrez le prévisualiser avant de le télécharger'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Format A4</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Haute qualité</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Sécurisé</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs flex flex-col items-center">
            <div className="mb-4">
              <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-lg font-bold text-green-700 mb-2 text-center">Facture créée avec succès !</div>
            <div className="text-sm text-gray-600 mb-6 text-center">Vous pouvez consulter votre facture, la télécharger ou en créer une nouvelle.</div>
            <div className="flex flex-col gap-2 w-full">
              <button
                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow hover:from-green-600 hover:to-emerald-700 transition-colors"
                onClick={handleDownload}
              >
                Télécharger le PDF
              </button>
              <button
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition-colors"
                onClick={handlePreview}
              >
                Prévisualiser le PDF
              </button>
              <button
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition-colors"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/');
                }}
              >
                Retour à Mes Factures
              </button>
              <button
                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow hover:from-green-600 hover:to-emerald-700 transition-colors"
                onClick={() => {
                  setShowSuccessModal(false);
                  window.location.reload();
                }}
              >
                Créer une autre facture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 