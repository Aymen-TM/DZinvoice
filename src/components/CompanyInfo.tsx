'use client';

import { Company } from '@/types/invoice';
import { useState, useEffect, useRef } from 'react';

interface CompanyInfoProps {
  company: Company;
  onCompanyChange: (company: Company) => void;
}

export default function CompanyInfo({ company, onCompanyChange }: CompanyInfoProps) {
  const [aiWarning, setAiWarning] = useState('');
  const [nifWarning, setNifWarning] = useState('');
  const [nisWarning, setNisWarning] = useState('');
  const [phoneWarning, setPhoneWarning] = useState('');
  const [capitalDisplay, setCapitalDisplay] = useState(company.capital);
  const [activiteOptions, setActiviteOptions] = useState<{ CODE: string; LIBELLE: string }[]>([]);
  const [activiteInput, setActiviteInput] = useState(company.activity || '');
  const [activiteSuggestions, setActiviteSuggestions] = useState<{ CODE: string; LIBELLE: string }[]>([]);
  const [showActiviteSuggestions, setShowActiviteSuggestions] = useState(false);
  const [activiteHighlighted, setActiviteHighlighted] = useState(-1);
  const activiteRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    fetch('/codes_nomenclature.json')
      .then(res => res.json())
      .then(data => setActiviteOptions(data));
  }, []);

  useEffect(() => {
    setActiviteInput(company.activity || '');
  }, [company.activity]);

  useEffect(() => {
    if (
      activiteHighlighted >= 0 &&
      activiteHighlighted < activiteSuggestions.length &&
      activiteRefs.current[activiteHighlighted]
    ) {
      activiteRefs.current[activiteHighlighted]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activiteHighlighted, activiteSuggestions]);

  const handleChange = (field: keyof Company, value: string) => {
    if (field === 'ai') {
      if (value.length > 11) {
        setAiWarning('Le numéro AI ne doit pas dépasser 11 caractères.');
      } else if (!/^\d*$/.test(value)) {
        setAiWarning('Le numéro AI ne doit contenir que des chiffres.');
      } else {
        setAiWarning('');
      }
    }
    if (field === 'nif') {
      if (!/^\d*$/.test(value)) {
        setNifWarning('Le NIF ne doit contenir que des chiffres.');
      } else {
        setNifWarning('');
      }
    }
    if (field === 'nis') {
      if (!/^\d*$/.test(value)) {
        setNisWarning('Le NIS ne doit contenir que des chiffres.');
      } else {
        setNisWarning('');
      }
    }
    if (field === 'phone') {
      // Only allow numbers, max 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      if (numericValue.length > 0 && numericValue.length !== 10) {
        setPhoneWarning('Le numéro de téléphone doit contenir exactement 10 chiffres.');
      } else {
        setPhoneWarning('');
      }
      onCompanyChange({
        ...company,
        [field]: numericValue,
      });
      return;
    }
    if (field === 'capital') {
      // Only allow numbers
      const numericValue = value.replace(/\D/g, '');
      // Format with thousands separator
      const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      setCapitalDisplay(formatted);
      onCompanyChange({
        ...company,
        [field]: numericValue,
      });
      return;
    }
    onCompanyChange({
      ...company,
      [field]: value,
    });
  };

  const handleActiviteInput = (value: string) => {
    setActiviteInput(value);
    onCompanyChange({ ...company, activity: value });
    if (value.length > 1) {
      const suggestions = activiteOptions.filter(opt =>
        opt.LIBELLE.toLowerCase().includes(value.toLowerCase()) ||
        opt.CODE.includes(value)
      ).slice(0, 10);
      setActiviteSuggestions(suggestions);
      setShowActiviteSuggestions(true);
      setActiviteHighlighted(-1);
    } else {
      setShowActiviteSuggestions(false);
      setActiviteHighlighted(-1);
    }
  };

  const handleActiviteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showActiviteSuggestions || activiteSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiviteHighlighted(h => Math.min(h + 1, activiteSuggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiviteHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      if (activiteHighlighted >= 0 && activiteHighlighted < activiteSuggestions.length) {
        handleActiviteSelect(activiteSuggestions[activiteHighlighted].LIBELLE);
      }
    } else if (e.key === 'Escape') {
      setShowActiviteSuggestions(false);
    }
  };

  const handleActiviteSelect = (libelle: string) => {
    setActiviteInput(libelle);
    onCompanyChange({ ...company, activity: libelle });
    setShowActiviteSuggestions(false);
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
            placeholder="Nom de l'entreprise"
          />
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            Activité
          </label>
          <div className="relative">
            <input
              type="text"
              value={activiteInput}
              onChange={(e) => handleActiviteInput(e.target.value)}
              onFocus={() => activiteInput.length > 1 && setShowActiviteSuggestions(true)}
              onBlur={() => setTimeout(() => setShowActiviteSuggestions(false), 100)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
              placeholder="Activité"
              autoComplete="off"
              onKeyDown={handleActiviteKeyDown}
            />
            {showActiviteSuggestions && activiteSuggestions.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-xl mt-1 max-h-56 overflow-y-auto shadow-lg">
                {activiteSuggestions.map((opt, idx) => (
                  <li
                    key={opt.CODE}
                    ref={el => { activiteRefs.current[idx] = el; }}
                    className={`px-4 py-2 cursor-pointer text-sm ${idx === activiteHighlighted ? 'bg-blue-100 font-semibold' : 'hover:bg-blue-100'}`}
                    onMouseDown={() => handleActiviteSelect(opt.LIBELLE)}
                  >
                    <span className="font-mono text-gray-500 mr-2">{opt.CODE}</span>
                    {opt.LIBELLE}
                  </li>
                ))}
              </ul>
            )}
          </div>
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
          <div className="relative">
            <input
              type="text"
              value={capitalDisplay}
              onChange={(e) => handleChange('capital', e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base pr-12"
              placeholder="Capital"
              inputMode="numeric"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">DA</span>
          </div>
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
            inputMode="tel"
            maxLength={10}
            pattern="[0-9]{10}"
          />
          {phoneWarning && (
            <p className="text-xs text-red-600 mt-1">{phoneWarning}</p>
          )}
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
            onChange={(e) => handleChange('nif', e.target.value.replace(/\D/g, ''))}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="NIF"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          {nifWarning && (
            <p className="text-xs text-red-600 mt-1">{nifWarning}</p>
          )}
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            AI
          </label>
          <input
            type="text"
            value={company.ai}
            onChange={(e) => handleChange('ai', e.target.value.replace(/\D/g, ''))}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="AI"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          {aiWarning && (
            <p className="text-xs text-red-600 mt-1">{aiWarning}</p>
          )}
        </div>

        <div className="space-y-2 group/item">
          <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover/item:text-blue-600 transition-colors duration-200">
            NIS
          </label>
          <input
            type="text"
            value={company.nis}
            onChange={(e) => handleChange('nis', e.target.value.replace(/\D/g, ''))}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 focus:bg-white/90 group-hover/item:border-blue-300 text-sm sm:text-base"
            placeholder="NIS"
            inputMode="numeric"
            pattern="[0-9]*"
          />
          {nisWarning && (
            <p className="text-xs text-red-600 mt-1">{nisWarning}</p>
          )}
        </div>
      </div>
    </div>
  );
} 