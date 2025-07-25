'use client';

import { useState } from 'react';

interface PreviewPDFButtonProps {
  pdfBytes: Uint8Array;
  className?: string;
}

export default function PreviewPDFButton({ pdfBytes, className = '' }: PreviewPDFButtonProps) {
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handlePreview = async () => {
    if (!pdfBytes || pdfBytes.length === 0) {
      alert('Aucun PDF disponible pour la prévisualisation');
      return;
    }

    setIsPreviewing(true);

    try {
      // Convert Uint8Array to Blob
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      // Create Blob URL
      const blobUrl = URL.createObjectURL(blob);
      
      // Open in new tab
      const newWindow = window.open(blobUrl, '_blank');
      
      if (!newWindow) {
        alert('Veuillez autoriser les popups pour prévisualiser le PDF');
        URL.revokeObjectURL(blobUrl);
        return;
      }

      // Clean up Blob URL after a delay to ensure the PDF loads
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);

    } catch (error) {
      console.error('Erreur lors de la prévisualisation du PDF:', error);
      alert('Erreur lors de la prévisualisation du PDF');
    } finally {
      setIsPreviewing(false);
    }
  };

  return (
    <button
      onClick={handlePreview}
      disabled={isPreviewing || !pdfBytes || pdfBytes.length === 0}
      className={`
        bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 
        text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold 
        flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl 
        transform hover:scale-105 active:scale-95 disabled:opacity-50 
        disabled:cursor-not-allowed min-h-[48px]
        ${className}
      `}
    >
      {isPreviewing ? (
        <>
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Ouverture...</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Prévisualiser le PDF</span>
        </>
      )}
    </button>
  );
} 