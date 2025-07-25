'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Company, Client, InvoiceMeta, Item, Totals, InvoiceData } from '@/types/invoice';
import CompanyInfo from '@/components/CompanyInfo';
import ClientInfo from '@/components/ClientInfo';
import InvoiceMetaComponent from '@/components/InvoiceMeta';
import ItemsList from '@/components/ItemsList';
import GeneratePDFButton from '@/components/GeneratePDFButton';
import { getCompleteInvoiceById } from '@/utils/invoiceStorage';
import { getClients as getERPClients, setClients as setERPClients } from '@/utils/erpStorage';
import type { Client as ERPClient } from '@/types/erp';
import { useSettings } from '@/hooks/useSettings';

function CreateInvoiceContent() {
  const searchParams = useSearchParams();
  const editInvoiceId = searchParams.get('edit');
  const isEditing = !!editInvoiceId;
  const { companySettings, invoiceSettings, generateInvoiceNumber, formatCurrency } = useSettings();

  const [company, setCompany] = useState<Company>({
    companyName: companySettings.name,
    activity: '',
    address: companySettings.address,
    capital: '',
    phone: companySettings.phone,
    email: companySettings.email,
    web: companySettings.website,
    bank: '',
    rc: '',
    nif: companySettings.taxNumber,
    ai: '',
    nis: '',
  });

  const [client, setClient] = useState<Client>({
    clientName: '',
    clientCode: '',
    activity: '',
    address: '',
    city: '',
    rc: '',
    nif: '',
    ai: '',
    nis: '',
  });

  const [meta, setMeta] = useState<InvoiceMeta>({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    terms: 'None',
    notes: '',
  });

  // Load invoice data for editing or generate new invoice number
  useEffect(() => {
    (async () => {
      if (isEditing && editInvoiceId) {
        // Load existing invoice data
        const invoice = await getCompleteInvoiceById(editInvoiceId);
        if (invoice) {
          // Load complete invoice data
          setCompany(invoice.company);
          setClient(invoice.client);
          setMeta(invoice.meta);
          setItems(invoice.items);
          setTotals(invoice.totals);
        }
      } else {
        // Generate new invoice number using settings
        try {
          const nextInvoiceNumber = await generateInvoiceNumber();
          setMeta(prev => ({
            ...prev,
            invoiceNumber: nextInvoiceNumber,
          }));
        } catch (error) {
          console.error('Error generating invoice number:', error);
          // Fallback to timestamp-based number
          const fallbackNumber = `FV/25${Date.now()}`;
          setMeta(prev => ({
            ...prev,
            invoiceNumber: fallbackNumber,
          }));
        }
      }
    })();
  }, [isEditing, editInvoiceId, generateInvoiceNumber]);

  // On mount, try to load beneficiary client and prefill company info
  useEffect(() => {
    (async () => {
      const erpClients: ERPClient[] = await getERPClients();
      const beneficiary = erpClients.find(c => c.famille === 'Bénéficiaire du logiciel');
      if (beneficiary) {
        setCompany({
          companyName: beneficiary.raisonSocial,
          activity: beneficiary.activite,
          address: beneficiary.adresse,
          capital: '',
          phone: '',
          email: '',
          web: '',
          bank: '',
          rc: beneficiary.rc,
          nif: beneficiary.nif,
          ai: beneficiary.ai,
          nis: beneficiary.nis,
        });
      } else {
        // Use settings if no beneficiary client found
        setCompany({
          companyName: companySettings.name,
          activity: '',
          address: companySettings.address,
          capital: '',
          phone: companySettings.phone,
          email: companySettings.email,
          web: companySettings.website,
          bank: '',
          rc: '',
          nif: companySettings.taxNumber,
          ai: '',
          nis: '',
        });
      }
    })();
  }, [companySettings]);

  // Save company info as ERP client with famille = 'Bénéficiaire du logiciel' when company info changes
  useEffect(() => {
    (async () => {
      if (!company.companyName || !company.rc) return;
      const erpClients: ERPClient[] = await getERPClients();
      const beneficiary = erpClients.find(c => c.famille === 'Bénéficiaire du logiciel');
      if (!beneficiary) {
        // Add new beneficiary client
        const newClient: ERPClient = {
          id: Date.now().toString(),
          codeTiers: 'BEN' + Math.floor(100000 + Math.random() * 900000),
          raisonSocial: company.companyName,
          famille: 'Bénéficiaire du logiciel',
          nom: '',
          prenom: '',
          activite: company.activity,
          adresse: company.address,
          ville: '',
          rc: company.rc,
          nif: company.nif,
          nis: company.nis,
          ai: company.ai,
        };
        await setERPClients([...erpClients, newClient]);
      } else {
        // Update existing beneficiary client
        const updated = erpClients.map(c =>
          c.famille === 'Bénéficiaire du logiciel'
            ? {
                ...c,
                raisonSocial: company.companyName,
                activite: company.activity,
                adresse: company.address,
                rc: company.rc,
                nif: company.nif,
                nis: company.nis,
                ai: company.ai,
              }
            : c
        );
        await setERPClients(updated);
      }
    })();
  }, [company]);

  const [items, setItems] = useState<Item[]>([]);

  const [totals, setTotals] = useState<Totals>({
    montantHT: 0,
    remise: 0,
    tva: 0,
    montantTTC: 0,
    amountInWords: 'Zéro dinars',
  });

  // Ensure invoiceData includes an id property
  const id = Date.now().toString();
  const invoiceData: InvoiceData = {
    id,
    company,
    client,
    meta,
    items,
    totals,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden pt-20">
      {/* Éléments d'arrière-plan animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
        {/* En-tête */}
        <div className="text-center mb-8 sm:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 sm:mb-8 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 sm:mb-6 animate-fade-in px-4">
            {isEditing ? 'Modifier la Facture' : 'Générateur de Factures'}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto leading-relaxed animate-fade-in-delay px-4">
            Créez des factures professionnelles avec une interface moderne et intuitive
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 px-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Interface moderne</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></div>
              <span>PDF professionnel</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-600"></div>
              <span>Calculs automatiques</span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
          {/* Informations sur l'entreprise */}
          <div className="transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform duration-300">
            <CompanyInfo company={company} onCompanyChange={setCompany} />
          </div>

          {/* Informations sur le client */}
          <div className="transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform duration-300">
            <ClientInfo client={client} onClientChange={setClient} />
          </div>

          {/* Métadonnées de la facture */}
          <div className="transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform duration-300">
            <InvoiceMetaComponent meta={meta} onMetaChange={setMeta} />
          </div>

          {/* Liste des articles */}
          <div className="transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform duration-300">
            <ItemsList 
              items={items} 
              onItemsChange={setItems} 
              totals={totals} 
              onTotalsChange={setTotals}
              currency={invoiceSettings.defaultCurrency}
              formatCurrency={formatCurrency}
            />
          </div>

          {/* Bouton Générer PDF */}
          <div className="transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-transform duration-300">
            <GeneratePDFButton invoiceData={invoiceData} isEditing={isEditing} />
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-12 sm:mt-16 lg:mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-4 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-center">Développé avec Next.js, React, TypeScript et Tailwind CSS</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delay {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <CreateInvoiceContent />
    </Suspense>
  );
} 