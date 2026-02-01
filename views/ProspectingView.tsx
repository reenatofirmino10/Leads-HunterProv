
import React, { useState, useCallback } from 'react';
import { ProspectType, PotentialLead } from '../types';
import ProspectingForm from '../components/ProspectingForm';
import ResultsTable from '../components/ResultsTable';
import LeadDetailsModal from '../components/LeadDetailsModal';
import { findProspects } from '../services/geminiService';
import Spinner from '../components/Spinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RADIUS_OPTIONS } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

const ProspectingView: React.FC = () => {
  // Form state lifted up to this view
  const [prospectType, setProspectType] = useState<ProspectType>(ProspectType.COMMERCIAL);
  const [segment, setSegment] = useState('');
  const [customSegment, setCustomSegment] = useState(''); // Added state for custom "Outro" segment
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
      setTotalResults(total);
      setTotalPages(Math.ceil(total / RESULTS_PER_PAGE));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
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
    <div className="space-y-8">
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

      {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}

      {error && (
        <div className="bg-[#FEF2F2] dark:bg-red-900/20 border border-[#FCA5A5] dark:border-red-800 text-[#DC2626] dark:text-red-400 px-4 py-3 rounded-md text-center">
          <p className="font-bold">Erro na Prospecção</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!isLoading && results.length > 0 && (
        <>
            <ResultsTable
            leads={results}
            onViewDetails={setSelectedLead}
            />
            {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-6 text-[#6B7280] dark:text-gray-400">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1 || isLoading}
                        className="px-4 py-2 bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#6B7280] dark:text-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                        <ChevronLeft size={18} className="mr-1" />
                        Anterior
                    </button>
                    <span className="font-medium">Página {currentPage} de {totalPages}</span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages || isLoading}
                        className="px-4 py-2 bg-[#FF6828] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E65014] transition-colors flex items-center"
                    >
                        Próxima
                        <ChevronRight size={18} className="ml-1" />
                    </button>
                </div>
            )}
        </>
      )}
      
      {!isLoading && !error && totalResults === 0 && searchParams && (
        <div className="text-center py-12 text-[#6B7280] dark:text-gray-400 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-[#111827] dark:text-gray-200">Poucas empresas encontradas para este filtro.</h3>
            <p className="mt-2">Tente ajustar o segmento ou buscar em cidades vizinhas para melhores resultados.</p>
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
