
import React, { useState, useCallback } from 'react';
import { ProspectType, PotentialLead } from '../types';
import ProspectingForm from '../components/ProspectingForm';
import ResultsTable from '../components/ResultsTable';
import LeadDetailsModal from '../components/LeadDetailsModal';
import { findProspects } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { ChevronLeft, ChevronRight, AlertCircle, SearchX } from 'lucide-react';
import { RADIUS_OPTIONS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

const ProspectingView: React.FC = () => {
  const [prospectType, setProspectType] = useState<ProspectType>(ProspectType.COMMERCIAL);
  const [segment, setSegment] = useState('');
  const [customSegment, setCustomSegment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [radius, setRadius] = useState(RADIUS_OPTIONS[3]); // Default to 25 km
  const [niche, setNiche] = useState('');
  const [keywords, setKeywords] = useState('');

  const [results, setResults] = useState<PotentialLead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<PotentialLead | null>(null);
  
  const [searchParams, setSearchParams] = useState<{ segment: string; city: string; state: string; radius: string; niche: string; keywords: string; customSegment?: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalResults, setTotalResults] = useState<number>(0);
  const RESULTS_PER_PAGE = 20;

  const { theme } = useTheme();

  const performSearch = useCallback(async (params: {segment: string, city: string, state: string, radius: string, niche: string, keywords: string, customSegment?: string}, page: number) => {
    setIsLoading(true);
    setError(null);
    if (page === 1) {
        setResults([]);
        setTotalResults(0);
        setTotalPages(0);
    }

    try {
      const { prospects, total } = await findProspects(params.segment, params.city, params.state, page, params.radius, params.niche, params.keywords, RESULTS_PER_PAGE, params.customSegment);
      setResults(prospects);
      // Se vier do fallback, pode ter poucos resultados, mas não é erro
      setTotalResults(total);
      setTotalPages(Math.ceil(total / RESULTS_PER_PAGE));
      
      if (prospects.length === 0) {
        // Estado vazio tratado na UI
      }
    } catch (err) {
      console.error("View Error:", err);
      setError('Não foi possível completar a busca. Tente novamente ou ajuste os filtros.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (searchData: {segment: string; city: string; state: string; radius: string; niche: string; keywords: string; customSegment?: string}) => {
    setSearchParams(searchData);
    setCurrentPage(1);
    await performSearch(searchData, 1);
  }, [performSearch]);
  
  const handlePageChange = async (newPage: number) => {
    if (!searchParams || newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    await performSearch(searchParams, newPage);
  };

  return (
    <div className="space-y-8 pb-12">
      <ProspectingForm
        prospectType={prospectType} setProspectType={setProspectType}
        segment={segment} setSegment={setSegment}
        customSegment={customSegment} setCustomSegment={setCustomSegment}
        city={city} setCity={setCity}
        state={state} setState={setState}
        radius={radius} setRadius={setRadius}
        niche={niche} setNiche={setNiche}
        keywords={keywords} setKeywords={setKeywords}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <Spinner />
            <p className="mt-4 text-gray-500 font-medium">Analisando mercado em tempo real...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl shadow-sm">
          <AlertCircle size={24} />
          <div>
              <p className="font-bold">Erro na Prospecção</p>
              <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && results.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ResultsTable
            leads={results}
            onViewDetails={setSelectedLead}
            />
            
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1 || isLoading}
                        className="px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center shadow-sm font-medium"
                    >
                        <ChevronLeft size={18} className="mr-1" />
                        Anterior
                    </button>
                    <span className="font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-sm">
                        {currentPage} / {totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages || isLoading}
                        className="px-5 py-2.5 bg-[#FF6828] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E65014] transition-all flex items-center shadow-lg shadow-orange-500/20 font-bold"
                    >
                        Próxima
                        <ChevronRight size={18} className="ml-1" />
                    </button>
                </div>
            )}
        </div>
      )}
      
      {!isLoading && !error && totalResults === 0 && searchParams && (
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                <SearchX size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nenhum resultado encontrado</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md">
                Não encontramos empresas com os critérios exatos em "{searchParams.city}". Tente aumentar o raio de busca ou usar termos mais genéricos.
            </p>
            <button 
                onClick={() => document.getElementById('segment')?.focus()}
                className="mt-6 text-[#FF6828] font-bold hover:underline"
            >
                Ajustar Filtros
            </button>
        </div>
      )}

      {selectedLead && searchParams && (
        <LeadDetailsModal
          lead={selectedLead}
          prospectType={prospectType}
          city={searchParams.city}
          state={searchParams.state}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
};

export default ProspectingView;
