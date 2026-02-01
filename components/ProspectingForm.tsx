
import React, { useState, useEffect } from 'react';
import { ProspectType } from '../types';
import { COMMERCIAL_SEGMENTS, INDUSTRIAL_SEGMENTS, RADIUS_OPTIONS } from '../constants';
import { Search, X, Store, Factory, Loader2 } from 'lucide-react';
import { getNichesForSegment } from '../services/geminiService';

interface ProspectingFormProps {
  prospectType: ProspectType;
  setProspectType: (type: ProspectType) => void;
  segment: string;
  setSegment: (segment: string) => void;
  customSegment: string; // New Prop
  setCustomSegment: (custom: string) => void; // New Prop
  city: string;
  setCity: (city: string) => void;
  state: string;
  setState: (state: string) => void;
  radius: string;
  setRadius: (radius: string) => void;
  niche: string;
  setNiche: (niche: string) => void;
  keywords: string;
  setKeywords: (keywords: string) => void;
  onSearch: (searchData: {segment: string; city: string; state: string; radius: string; niche: string; keywords: string; customSegment?: string}) => void;
  isLoading: boolean;
}

const ProspectingForm: React.FC<ProspectingFormProps> = ({ 
    prospectType, setProspectType,
    segment, setSegment,
    customSegment, setCustomSegment,
    city, setCity,
    state, setState,
    radius, setRadius,
    niche, setNiche,
    keywords, setKeywords,
    onSearch, isLoading
}) => {
  const segments = prospectType === ProspectType.COMMERCIAL ? COMMERCIAL_SEGMENTS : INDUSTRIAL_SEGMENTS;
  const [availableNiches, setAvailableNiches] = useState<string[]>([]);
  const [isNicheLoading, setIsNicheLoading] = useState(false);

  // Clear custom segment if user switches away from "Outro"
  useEffect(() => {
    if (segment !== 'Outro') {
        setCustomSegment('');
    }
  }, [segment, setCustomSegment]);

  useEffect(() => {
    const fetchNiches = async () => {
        // Core Logic:
        // 1. If standard segment selected: Fetch niches immediately.
        // 2. If 'Outro' selected: Fetch niches ONLY if customSegment has content.
        
        const shouldFetch = (segment && segment !== 'Outro') || (segment === 'Outro' && customSegment && customSegment.length > 2);

        if (shouldFetch) {
            setIsNicheLoading(true);
            setNiche(''); // Reset selected niche when segment changes
            setAvailableNiches([]);
            try {
                // Pass customSegment to the service if applicable
                const niches = await getNichesForSegment(segment, customSegment);
                setAvailableNiches(niches);
            } catch (error) {
                console.error("Failed to fetch niches", error);
                setAvailableNiches([]);
            } finally {
                setIsNicheLoading(false);
            }
        } else if (!segment) {
            setAvailableNiches([]);
            setNiche('');
        }
    };

    // Debounce for custom input to avoid API spam while typing
    const timeoutId = setTimeout(() => {
        fetchNiches();
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [segment, customSegment, setNiche]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: If 'Outro' is selected, custom text is required.
    if (segment === 'Outro' && !customSegment.trim()) {
        alert('Por favor, descreva o segmento desejado.');
        return;
    }

    if (segment && city && state) {
      onSearch({ segment, city, state, radius, niche, keywords, customSegment });
    } else {
      alert('Por favor, preencha os campos obrigatórios: Segmento, Cidade e Estado.');
    }
  };

  const handleClearFilters = () => {
    setSegment('');
    setCustomSegment('');
    setCity('');
    setState('');
    setRadius(RADIUS_OPTIONS[3]);
    setNiche('');
    setKeywords('');
    setAvailableNiches([]);
  };

  // --- UI/UX STANDARDIZATION CONSTANTS ---
  
  // 1. Label Alignment: 
  const labelClasses = "flex items-baseline text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2 ml-0.5";
  
  // 2. Input/Select Foundation:
  const baseInputStyles = "w-full h-11 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6828]/20 focus:border-[#FF6828] dark:focus:border-[#FF6828] hover:border-gray-300 dark:hover:border-gray-600";
  
  // 3. Variant Specifics:
  const inputClasses = `${baseInputStyles} px-4`;
  const selectClasses = `${baseInputStyles} appearance-none cursor-pointer pl-4 pr-10`; 
  const selectIconContainerClasses = "pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 dark:text-gray-400";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100/80 dark:border-gray-800 overflow-hidden relative transition-colors duration-300">
      
      {/* 1. Header Section */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-8 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center justify-center text-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
                Encontre Empresas
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-2xl">
                Prospecção inteligente de empresas que utilizam rótulos e etiquetas
            </p>
        </div>
      </div>

      <div className="p-6 md:p-8">
        
        {/* 2. Tabs Section */}
        <div className="flex justify-center mb-8">
            <div className="bg-gray-100/80 dark:bg-gray-800 p-1.5 rounded-xl flex w-full md:w-auto min-w-[320px] shadow-inner">
                <button
                    type="button"
                    onClick={() => { setProspectType(ProspectType.COMMERCIAL); setSegment(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        prospectType === ProspectType.COMMERCIAL
                        ? 'bg-white dark:bg-gray-700 text-[#FF6828] shadow-sm ring-1 ring-black/5 dark:ring-white/5 transform scale-[1.02]' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                >
                    <Store size={18} />
                    Comercial
                </button>
                <button
                    type="button"
                    onClick={() => { setProspectType(ProspectType.INDUSTRIAL); setSegment(''); }}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        prospectType === ProspectType.INDUSTRIAL
                        ? 'bg-white dark:bg-gray-700 text-[#FF6828] shadow-sm ring-1 ring-black/5 dark:ring-white/5 transform scale-[1.02]' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                    }`}
                >
                    <Factory size={18} />
                    Industrial
                </button>
            </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
            
            {/* Unified Grid for Perfect Alignment */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Row 1 Items */}
                <div className="group md:col-span-6 lg:col-span-3">
                    <label htmlFor="segment" className={labelClasses}>
                        Segmento 
                    </label>
                    <div className="relative">
                        <select id="segment" value={segment} onChange={(e) => setSegment(e.target.value)} required className={selectClasses}>
                            <option value="" disabled>Selecione...</option>
                            {segments.map((s) => (<option key={s} value={s}>{s}</option>))}
                            <option value="Outro" className="font-semibold text-[#FF6828]">Outro (Descrever manual)</option>
                        </select>
                        <div className={selectIconContainerClasses}>
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Conditional Custom Segment Input - Appears next to segment if 'Outro' selected */}
                {segment === 'Outro' && (
                    <div className="group md:col-span-6 lg:col-span-3 animate-fade-in-down">
                        <label htmlFor="customSegment" className={labelClasses}>
                            Descreva o segmento desejado
                        </label>
                        <input 
                            id="customSegment" 
                            type="text" 
                            value={customSegment} 
                            onChange={(e) => setCustomSegment(e.target.value)} 
                            placeholder="Ex: farmácia de manipulação" 
                            required 
                            className={inputClasses}
                            autoFocus
                            autoComplete="off"
                        />
                    </div>
                )}

                <div className="group md:col-span-6 lg:col-span-3">
                    <label htmlFor="city" className={labelClasses}>Cidade</label>
                    <input 
                        id="city" 
                        type="text" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        placeholder="Ex: Curitiba" 
                        required 
                        className={inputClasses} 
                        autoComplete="off"
                        name="city_search_field" 
                    />
                </div>

                <div className="group md:col-span-6 lg:col-span-3">
                    <label htmlFor="state" className={labelClasses}>Estado (UF)</label>
                    <input 
                        id="state" 
                        type="text" 
                        value={state} 
                        onChange={(e) => setState(e.target.value.toUpperCase())} 
                        placeholder="Ex: PR" 
                        maxLength={2} 
                        required 
                        className={`${inputClasses} uppercase placeholder:normal-case`} 
                        autoComplete="off"
                        name="state_search_field"
                    />
                </div>

                <div className="group md:col-span-6 lg:col-span-3">
                    <label htmlFor="radius" className={labelClasses}>
                        Raio
                    </label>
                    <div className="relative">
                        <select id="radius" value={radius} onChange={(e) => setRadius(e.target.value)} className={selectClasses}>
                            {RADIUS_OPTIONS.map((r) => (<option key={r} value={r}>{r}</option>))}
                        </select>
                        <div className={selectIconContainerClasses}>
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Row 2 Items */}
                 <div className="group md:col-span-12 lg:col-span-6">
                    <label htmlFor="niche" className={labelClasses}>
                        Nicho Específico
                    </label>
                    <div className="relative">
                        <select id="niche" value={niche} onChange={(e) => setNiche(e.target.value)}
                                disabled={!segment || isNicheLoading || availableNiches.length === 0}
                                className={`${selectClasses} disabled:bg-gray-50 disabled:text-gray-400 disabled:dark:bg-gray-800 disabled:dark:text-gray-600 disabled:cursor-not-allowed`}>
                            <option value="">{isNicheLoading ? 'Aguarde, carregando nichos...' : (segment ? (availableNiches.length > 0 ? 'Selecione um nicho (opcional)' : 'Nenhum nicho encontrado') : 'Selecione um segmento acima')}</option>
                            {availableNiches.map((n) => (<option key={n} value={n}>{n}</option>))}
                        </select>
                        {isNicheLoading ? (
                            <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-[#FF6828]" />
                        ) : (
                            <div className={selectIconContainerClasses}>
                                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                            </div>
                        )}
                    </div>
                </div>

                <div className="group md:col-span-12 lg:col-span-6">
                    <label htmlFor="keywords" className={labelClasses}>
                        Palavras-chave
                        <span className="ml-1.5 text-[10px] text-gray-400 dark:text-gray-500 font-normal normal-case">(OPCIONAL)</span>
                    </label>
                    <input 
                        id="keywords" 
                        type="text" 
                        value={keywords} 
                        onChange={(e) => setKeywords(e.target.value)} 
                        placeholder="Ex: embalagens, rótulos, premium"
                        className={inputClasses}
                        autoComplete="off"
                    />
                </div>
            </div>

            {/* 5. Action Buttons */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                 <button type="button" onClick={handleClearFilters}
                         className="w-full sm:w-auto px-6 py-3 rounded-xl text-gray-500 dark:text-gray-400 font-medium text-sm hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                     <X size={16} />
                     Limpar Filtros
                 </button>
                 
                 <button type="submit" disabled={isLoading}
                         className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-8 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0
                         ${isLoading 
                            ? 'bg-[#FF6828] cursor-wait opacity-90' 
                            : 'bg-[#FF6828] hover:bg-[#E65014] hover:shadow-orange-500/30'
                         }`}>
                     {isLoading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Buscando...
                        </>
                     ) : (
                        <>
                            <Search size={20} /> 
                            Buscar Empresas
                        </>
                     )}
                 </button>
             </div>
        </form>
      </div>
    </div>
  );
};

export default ProspectingForm;
