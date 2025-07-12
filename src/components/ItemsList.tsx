'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Item, Totals } from '@/types/invoice';
import { numberToFrenchWords } from '@/utils/numberToWords';

interface ItemsListProps {
  items: Item[];
  onItemsChange: (items: Item[]) => void;
  totals: Totals;
  onTotalsChange: (totals: Totals) => void;
}

export default function ItemsList({ items, onItemsChange, totals, onTotalsChange }: ItemsListProps) {
  const [remise, setRemise] = useState(0);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const addItem = () => {
    setIsAddingItem(true);
    const newItem: Item = {
      id: uuidv4(),
      reference: '',
      designation: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      tva: 19,
    };
    onItemsChange([...items, newItem]);
    
    // Reset animation state after a delay
    setTimeout(() => setIsAddingItem(false), 500);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate amount if quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    });
    
    onItemsChange(updatedItems);
  };

  // Calculate totals whenever items or remise changes
  useEffect(() => {
    const montantHT = items.reduce((sum, item) => sum + item.amount, 0);
    const remiseAmount = (montantHT * remise) / 100;
    const montantHTAfterRemise = montantHT - remiseAmount;
    const tva = items.reduce((sum, item) => sum + (item.amount * item.tva / 100), 0);
    const timbre = 100; // Fixed timbre amount
    const montantTTC = montantHTAfterRemise + tva + timbre;

    const newTotals: Totals = {
      montantHT,
      remise: remiseAmount,
      tva,
      timbre,
      montantTTC,
      amountInWords: numberToFrenchWords(montantTTC),
    };

    onTotalsChange(newTotals);
  }, [items, remise, onTotalsChange]);

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">Articles et services</h2>
            <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Ajoutez les articles ou services de votre facture</p>
          </div>
        </div>
        <button
          onClick={addItem}
          disabled={isAddingItem}
          className={`
            bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95
            ${isAddingItem ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${isAddingItem ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>{isAddingItem ? 'Ajout...' : 'Ajouter un article'}</span>
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-xl font-medium mb-2">Aucun article ajouté</p>
          <p className="text-gray-400">Cliquez sur "Ajouter un article" pour commencer</p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 shadow-inner">
            <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
              <div className="col-span-2">Référence</div>
              <div className="col-span-4">Désignation</div>
              <div className="col-span-1">Quantité</div>
              <div className="col-span-2">Prix unitaire</div>
              <div className="col-span-2">Montant</div>
              <div className="col-span-1">TVA %</div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className={`
                  bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:border-orange-300
                  ${isAddingItem && index === items.length - 1 ? 'animate-pulse bg-orange-50/50' : ''}
                `}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2 group/item">
                    <input
                      type="text"
                      value={item.reference}
                      onChange={(e) => updateItem(item.id, 'reference', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white group-hover/item:border-orange-300"
                      placeholder="Référence"
                    />
                  </div>
                  
                  <div className="col-span-4 group/item">
                    <input
                      type="text"
                      value={item.designation}
                      onChange={(e) => updateItem(item.id, 'designation', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white group-hover/item:border-orange-300"
                      placeholder="Désignation"
                    />
                  </div>
                  
                  <div className="col-span-1 group/item">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white group-hover/item:border-orange-300"
                    />
                  </div>
                  
                  <div className="col-span-2 group/item">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white group-hover/item:border-orange-300"
                    />
                  </div>
                  
                  <div className="col-span-2 group/item">
                    <input
                      type="number"
                      value={item.amount.toFixed(2)}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50/70 group-hover/item:bg-gray-100/70 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="col-span-1 group/item">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.tva}
                      onChange={(e) => updateItem(item.id, 'tva', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white group-hover/item:border-orange-300"
                    />
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 transition-all duration-300 p-3 rounded-lg hover:bg-red-50 transform hover:scale-110 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Remise Input */}
          <div className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-inner">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Remise (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={remise}
                onChange={(e) => setRemise(parseFloat(e.target.value) || 0)}
                className="w-32 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/70 hover:bg-white/90 focus:bg-white"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="mt-10 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 shadow-inner">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Récapitulatif</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-200">
                    <span className="text-sm text-gray-600">Montant HT:</span>
                    <span className="font-semibold text-gray-900">{totals.montantHT.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-200">
                    <span className="text-sm text-gray-600">Remise:</span>
                    <span className="font-semibold text-red-600">{totals.remise.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-200">
                    <span className="text-sm text-gray-600">TVA:</span>
                    <span className="font-semibold text-gray-900">{totals.tva.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-200">
                    <span className="text-sm text-gray-600">Timbre:</span>
                    <span className="font-semibold text-gray-900">{totals.timbre.toFixed(2)} DA</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-200">
                    <span className="text-lg font-bold text-gray-900">Montant TTC:</span>
                    <span className="text-xl font-bold text-green-600">{totals.montantTTC.toFixed(2)} DA</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Montant en lettres</span>
                </h3>
                <div className="text-sm text-gray-700 bg-white/70 p-6 rounded-lg border border-gray-200 hover:bg-white/90 transition-all duration-300 min-h-[120px] flex items-center">
                  <span className="leading-relaxed">{totals.amountInWords}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 