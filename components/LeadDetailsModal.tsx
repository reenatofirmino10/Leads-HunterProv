
import React, { useState, useEffect, useCallback } from 'react';
import { PotentialLead, LeadAnalysis, ProspectType } from '../types';
import { generateLeadAnalysis } from '../services/geminiService';
import Spinner from './Spinner';
import { useAppContext } from '../contexts/AppContext';
import { 
    X, Phone, Globe, Instagram, Copy, Check, MessageSquare, 
    Mic, Mail, AlertTriangle, Lightbulb, Factory, Target, 
    BarChart3, PlusCircle, CheckCircle, MapPin, Linkedin, 
    Users, ExternalLink, Network, Search, RefreshCw, ShieldCheck, Zap,
    Map
} from 'lucide-react';

interface LeadDetailsModalProps {
  lead: PotentialLead;
  prospectType: ProspectType;
  city: string;
  state: string;
  onClose: () => void;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, prospectType, city, state, onClose }) => {
  const [analysis, setAnalysis] = useState<LeadAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { addLead, leads: funnelLeads } = useAppContext();
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'phone' | 'email' | 'objections' | 'connections'>('whatsapp');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const leadExists = funnelLeads.some(l => l.nome === lead.nome && l.cidade === lead.cidade);
    setIsAdded(leadExists);
  }, [funnelLeads, lead]);
  
  const fetchAnalysis = useCallback(async () => {
    setIsLoading(true);
    setAnalysis(null);
    try {
      const result = await generateLeadAnalysis(lead);
      setAnalysis(result);
    } catch (error) {
      console.error("Failed to generate analysis", error);
    } finally {
      setIsLoading(false);
    }
  }, [lead]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);
  
  const handleAddLead = () => {
    if (isAdded) return;
    addLead(lead, prospectType, city, state);
    setIsAdded(true);
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lead.nome} ${lead.cidade} ${lead.estado}`)}`;

  return (
    // FIX: Layout adjust to respect System Header (top-[80px]) and z-index below header (z-40)
    <div className="fixed inset-x-0 bottom-0 top-[80px] bg-gray-900/60 backdrop-blur-sm flex items-start justify-center z-40 p-4 lg:p-6" onClick={onClose}>
      <div 
        className="bg-[#F9FAFB] dark:bg-gray-950 w-full max-w-[1400px] h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200 dark:border-gray-800 ring-1 ring-black/5" 
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ==================================================================================
            LEFT COLUMN: MAIN CONTENT (Scrollable)
           ================================================================================== */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950">
            
            {/* HEADER */}
            <header className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start shrink-0 bg-white dark:bg-gray-950 sticky top-0 z-20">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                            <Factory className="text-[#FF6828] h-5 w-5" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{lead.nome}</h2>
                        {lead.site && (
                            <a href={lead.site.startsWith('http') ? lead.site : `https://${lead.site}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF6828] transition-colors">
                                <Globe size={16} />
                            </a>
                        )}
                        {lead.instagram && (
                             <a href={lead.instagram.startsWith('http') ? lead.instagram : `https://${lead.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF6828] transition-colors">
                                <Instagram size={16} />
                            </a>
                        )}
                    </div>

                    {/* CONTEXTUAL INTRODUCTION */}
                    {analysis?.short_context && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3 leading-relaxed max-w-2xl font-medium animate-in fade-in duration-500">
                            {analysis.short_context}
                        </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5"><Target size={14} className="text-[#FF6828]"/> {lead.segmento}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        
                        {/* INTERACTIVE LOCATION POPOVER */}
                        <div className="relative group">
                            <span className="flex items-center gap-1.5 cursor-help hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                                <MapPin size={14} className="text-gray-400"/> 
                                <span className="border-b border-dashed border-gray-300 dark:border-gray-600 pb-0.5">{lead.cidade}, {lead.estado}</span>
                            </span>
                            
                            {/* POPOVER CONTENT */}
                            <div className="absolute top-full left-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform translate-y-2 group-hover:translate-y-0">
                                <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white dark:bg-gray-800 border-t border-l border-gray-100 dark:border-gray-700 transform rotate-45"></div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Localização Aproximada</p>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 leading-snug">
                                    {lead.cidade}, {lead.estado}
                                </p>
                                <a 
                                    href={googleMapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors group/link"
                                >
                                    <Map size={14} className="text-blue-500 group-hover/link:text-blue-600"/> 
                                    Abrir no Google Maps
                                </a>
                            </div>
                        </div>

                        {lead.telefone && (
                            <>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400"/> {lead.telefone}</span>
                            </>
                        )}
                    </div>
                </div>
                <button onClick={onClose} className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full transition-all">
                    <X size={20} />
                </button>
            </header>

            {/* CONTENT BODY */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                {isLoading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <Spinner />
                        <p className="text-gray-400 font-medium animate-pulse">Consultando inteligência comercial...</p>
                    </div>
                ) : !analysis ? (
                     <div className="h-full flex flex-col items-center justify-center gap-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full">
                            <AlertTriangle size={32} className="text-red-500"/>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-medium">Análise indisponível no momento.</p>
                        <button onClick={fetchAnalysis} className="px-6 py-2 bg-[#FF6828] text-white font-bold rounded-lg hover:bg-[#E65014] transition-all flex items-center gap-2">
                            <RefreshCw size={18}/> Tentar Novamente
                        </button>
                    </div>
                ) : (
                    <>
                        {/* 1. PAINEL DE AÇÃO COMERCIAL (SCRIPTS) */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <MessageSquare size={18} className="text-[#FF6828]"/>
                                    Painel de Ação Comercial
                                </h3>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full border border-green-100 dark:border-green-800">
                                    <ShieldCheck size={12} />
                                    <span className="text-[10px] font-bold uppercase tracking-wide">Inteligência Validada</span>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                                {/* TABS AS PILLS */}
                                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex gap-2 overflow-x-auto">
                                    {[
                                        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                                        { id: 'phone', label: 'Cold Call', icon: Phone },
                                        { id: 'email', label: 'Cold Mail', icon: Mail },
                                        { id: 'objections', label: 'Objeções', icon: ShieldCheck },
                                        { id: 'connections', label: 'Decisores', icon: Users },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
                                                ${activeTab === tab.id 
                                                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' 
                                                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            <tab.icon size={14} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* TAB CONTENT */}
                                <div className="p-6 min-h-[220px] bg-white dark:bg-gray-900">
                                    {activeTab === 'connections' ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1 md:col-span-2 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-blue-600 dark:text-blue-400"><Linkedin size={20}/></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Página Institucional</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Mapeamento corporativo</p>
                                                    </div>
                                                </div>
                                                <a href={analysis.connections.linkedin_company_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                                    Acessar <ExternalLink size={12}/>
                                                </a>
                                            </div>
                                            {analysis.connections.potential_decisors.map((d, i) => (
                                                <div key={i} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-gray-700 transition-all bg-gray-50 dark:bg-gray-800/50">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">{d.name.charAt(0)}</div>
                                                        <a href={d.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#FF6828]"><Search size={16}/></a>
                                                    </div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{d.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{d.role}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : activeTab === 'objections' ? (
                                        <div className="space-y-3">
                                            {analysis.scripts.objections_handling.map((obj, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="mt-1 shrink-0"><AlertTriangle size={16} className="text-orange-500"/></div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">"{obj.objection}"</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{obj.response}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <div className="text-base text-gray-700 dark:text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">
                                                {activeTab === 'whatsapp' && analysis.scripts.whatsapp}
                                                {activeTab === 'phone' && analysis.scripts.phone_pitch}
                                                {activeTab === 'email' && analysis.scripts.email_template}
                                            </div>
                                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => copyToClipboard(
                                                        activeTab === 'whatsapp' ? analysis.scripts.whatsapp : 
                                                        activeTab === 'phone' ? analysis.scripts.phone_pitch : 
                                                        analysis.scripts.email_template, 
                                                        activeTab
                                                    )}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-lg hover:bg-black transition-colors"
                                                >
                                                    {copiedSection === activeTab ? <Check size={14} className="text-green-400"/> : <Copy size={14}/>}
                                                    {copiedSection === activeTab ? 'Copiado' : 'Copiar Texto'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 2. ANÁLISE TÉCNICA (GRID) */}
                        <section className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <Zap size={18} className="text-[#FF6828]"/>
                                Análise Técnica do Prospect
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Target size={14}/> Materiais Recomendados
                                    </h4>
                                    <ul className="space-y-3">
                                        {analysis.technical.probable_materials.map((mat, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6828]"></div>
                                                {mat}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">Evidência de uso:</span> {analysis.technical.usage_evidence}
                                    </div>
                                </div>
                                <div className="border-l border-gray-100 dark:border-gray-800 md:pl-6">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertTriangle size={14}/> Pontos de Atenção
                                    </h4>
                                    <ul className="space-y-3">
                                        {analysis.technical.potential_risks.map((risk, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                                                <X size={14} className="mt-0.5 text-red-400 shrink-0"/>
                                                {risk}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 3. OPORTUNIDADE COMERCIAL (DARK CARD) */}
                        <section className="bg-[#1F2937] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6828] blur-[80px] opacity-20 pointer-events-none"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-white">
                                        <Lightbulb size={18} className="text-[#FF6828]"/>
                                        Oportunidade Comercial
                                    </h3>
                                    <p className="text-gray-300 text-lg font-medium leading-relaxed mb-4">
                                        "{analysis.commercial.opportunity_summary}"
                                    </p>
                                </div>
                                <div className="flex-1 w-full space-y-3">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Principais Benefícios</p>
                                    {analysis.commercial.key_benefits.map((benefit, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                            <CheckCircle size={16} className="text-green-400 shrink-0"/>
                                            <span className="text-sm text-gray-200">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>

        {/* ==================================================================================
            RIGHT COLUMN: EXECUTIVE SUMMARY (Fixed width on desktop)
           ================================================================================== */}
        <div className="w-full md:w-[360px] bg-[#111827] text-white flex flex-col shrink-0 overflow-y-auto border-t md:border-t-0 md:border-l border-gray-800">
            <div className="p-8 space-y-8 flex-1 flex flex-col">
                
                <div className="space-y-2">
                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <BarChart3 size={20} className="text-[#FF6828]"/> 
                        Perfil de Demanda
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">Resumo executivo do potencial</p>
                </div>

                {/* VOLUME & FREQUENCY GRID */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#1F2937] p-4 rounded-2xl border border-gray-800 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Volume</p>
                        <p className="text-lg font-bold text-white">{lead.volume_estimado}</p>
                        <div className={`h-1 w-8 mx-auto mt-2 rounded-full ${lead.volume_estimado === 'Alto' ? 'bg-green-500' : lead.volume_estimado === 'Médio' ? 'bg-yellow-500' : 'bg-gray-600'}`}></div>
                    </div>
                    <div className="bg-[#1F2937] p-4 rounded-2xl border border-gray-800 text-center">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Frequência</p>
                        <p className="text-lg font-bold text-white">{lead.frequencia_compra}</p>
                        <div className="h-1 w-8 mx-auto mt-2 rounded-full bg-blue-500"></div>
                    </div>
                </div>

                {/* SUBSTRATE HIGHLIGHT */}
                <div className="bg-[#FF6828] p-6 rounded-2xl shadow-lg shadow-orange-900/20 text-center space-y-2 transform hover:scale-[1.02] transition-transform duration-300">
                    <p className="text-[10px] text-orange-100 uppercase font-black tracking-widest">Substrato Base</p>
                    <p className="text-xl font-black text-white leading-tight break-words">
                        {lead.substrato_recomendado}
                    </p>
                </div>

                {/* PRODUCT LIST */}
                <div className="space-y-3">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Aplicação Provável</p>
                    <div className="p-4 bg-[#1F2937] rounded-2xl border border-gray-800">
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {lead.produtos_que_usa}
                        </p>
                    </div>
                </div>

                {/* DISCREET LOGISTICS BLOCK */}
                <div className="mt-auto pt-6 border-t border-gray-800">
                     <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Logística</p>
                            <p className="text-sm font-bold text-gray-300 flex items-center gap-1">
                                {lead.cidade} <span className="text-gray-600">·</span> {lead.estado}
                            </p>
                        </div>
                        <a 
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#FF6828] hover:text-white transition-colors flex items-center gap-1 font-bold group"
                        >
                            <MapPin size={12} className="group-hover:scale-110 transition-transform"/> Mapa
                        </a>
                     </div>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};

export default LeadDetailsModal;
