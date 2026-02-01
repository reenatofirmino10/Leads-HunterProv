
import React, { useState, useEffect, useCallback } from 'react';
import { PotentialLead, LeadAnalysis, ProspectType } from '../types';
import { generateLeadAnalysis } from '../services/geminiService';
import Spinner from './Spinner';
import { useAppContext } from '../contexts/AppContext';
import { 
    X, Phone, Globe, Instagram, Copy, Check, MessageSquare, 
    Mic, Mail, AlertTriangle, Lightbulb, Factory, Target, 
    BarChart3, PlusCircle, CheckCircle, MapPin, Linkedin, 
    Users, ExternalLink, Network, Search
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

  const renderSocialIcon = (url: string | null, icon: React.ReactNode) => {
      if (!url) return null;
      return (
        <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" 
           className="text-gray-400 hover:text-[#FF6828] transition-colors bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
            {icon}
        </a>
      );
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-300" onClick={(e) => e.stopPropagation()}>
        
        {/* COMPACT HEADER */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
            <div className="flex items-start gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
                    <Factory className="text-[#FF6828] h-8 w-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{lead.nome}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center"><Target size={14} className="mr-1"/> {lead.segmento}</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                        <span className="flex items-center"><MapPin size={14} className="mr-1"/> {lead.cidade}, {lead.estado}</span>
                        {lead.telefone && (
                            <>
                            <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                            <span className="flex items-center font-medium text-gray-700 dark:text-gray-300"><Phone size={14} className="mr-1"/> {lead.telefone}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
                {renderSocialIcon(lead.site, <Globe size={18}/>)}
                {renderSocialIcon(lead.instagram, <Instagram size={18}/>)}
                {analysis?.connections?.linkedin_company_url && renderSocialIcon(analysis.connections.linkedin_company_url, <Linkedin size={18}/>)}
                <button onClick={onClose} className="ml-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all">
                    <X size={24} />
                </button>
            </div>
        </div>
        
        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50 p-6 md:p-8">
            {isLoading ? (
                <div className="h-full flex items-center justify-center min-h-[400px]">
                    <Spinner />
                </div>
            ) : !analysis ? (
                <div className="text-center py-10 text-red-500">Falha ao carregar análise. Tente novamente.</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN - TECHNICAL & STRATEGIC (70%) */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* 3. SCRIPTS DE ABORDAGEM (TABS) */}
                        <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto scrollbar-hide">
                                {[
                                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                                    { id: 'phone', label: 'Ligação (Pitch)', icon: Mic },
                                    { id: 'email', label: 'E-mail', icon: Mail },
                                    { id: 'objections', label: 'Objeções', icon: AlertTriangle },
                                    { id: 'connections', label: '🔗 Conexões Comerciais', icon: Network },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all whitespace-nowrap
                                            ${activeTab === tab.id 
                                                ? 'bg-white dark:bg-gray-900 text-[#FF6828] border-b-2 border-[#FF6828]' 
                                                : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-transparent'
                                            }`}
                                    >
                                        <tab.icon size={16} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="p-6 min-h-[300px]">
                                {activeTab === 'connections' ? (
                                    <div className="space-y-6">
                                        {/* CARD 1 — PERFIL INSTITUCIONAL */}
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between gap-4 group">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <Linkedin size={24} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Perfil Institucional</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Acesse a página institucional da empresa no LinkedIn.</p>
                                                </div>
                                            </div>
                                            <a 
                                                href={analysis.connections.linkedin_company_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="px-5 py-2.5 bg-[#FF6828] hover:bg-[#E65014] text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-orange-500/20"
                                            >
                                                Abrir LinkedIn da Empresa
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>

                                        {/* CARD 2 — DECISORES POTENCIAIS */}
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Users size={20} className="text-[#FF6828]" />
                                                <h4 className="font-bold text-gray-800 dark:text-gray-200">Possíveis Decisores</h4>
                                            </div>
                                            <div className="space-y-3">
                                                {analysis.connections.potential_decisors.map((decisor, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs uppercase">
                                                                {decisor.name.substring(0, 1)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{decisor.name}</p>
                                                                <p className="text-[11px] text-gray-500 dark:text-gray-400">{decisor.role}</p>
                                                            </div>
                                                        </div>
                                                        <a 
                                                            href={decisor.linkedin_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Abrir Perfil no LinkedIn"
                                                        >
                                                            <ExternalLink size={18} />
                                                        </a>
                                                    </div>
                                                ))}
                                                <button className="w-full mt-2 py-2 text-xs font-bold text-[#FF6828] hover:text-[#E65014] transition-colors flex items-center justify-center gap-2 border border-dashed border-orange-200 dark:border-orange-900/30 rounded-lg bg-orange-50/30 dark:bg-transparent">
                                                    <Search size={14} />
                                                    Buscar mais contatos
                                                </button>
                                            </div>
                                        </div>

                                        {/* CARD 3 — MAPA DE INFLUÊNCIA */}
                                        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Target size={20} className="text-[#FF6828]" />
                                                <h4 className="font-bold text-gray-800 dark:text-gray-200">Sugestão de Abordagem</h4>
                                            </div>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700 relative group">
                                                <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed">
                                                    {analysis.connections.influence_map}
                                                </p>
                                                <button 
                                                    onClick={() => copyToClipboard(analysis.connections.influence_map, 'influence')}
                                                    className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-gray-400 hover:text-[#FF6828] transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                                    title="Copiar abordagem sugerida"
                                                >
                                                    {copiedSection === 'influence' ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : activeTab === 'objections' ? (
                                    <div className="space-y-4">
                                        {analysis.scripts.objections_handling.map((obj, i) => (
                                            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-2 text-red-500 dark:text-red-400">"{obj.objection}"</p>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm pl-3 border-l-2 border-green-500">{obj.response}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="relative group">
                                        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                            {activeTab === 'whatsapp' && analysis.scripts.whatsapp}
                                            {activeTab === 'phone' && analysis.scripts.phone_pitch}
                                            {activeTab === 'email' && analysis.scripts.email_template}
                                        </div>
                                        <button 
                                            onClick={() => copyToClipboard(
                                                activeTab === 'whatsapp' ? analysis.scripts.whatsapp : 
                                                activeTab === 'phone' ? analysis.scripts.phone_pitch : 
                                                analysis.scripts.email_template, 
                                                activeTab
                                            )}
                                            className="absolute top-4 right-4 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:text-[#FF6828] dark:hover:text-[#FF6828] transition-all opacity-0 group-hover:opacity-100"
                                            title="Copiar Script"
                                        >
                                            {copiedSection === activeTab ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* 1. DIAGNÓSTICO TÉCNICO */}
                        <section className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-4">
                                <Factory size={20} className="text-[#FF6828]"/>
                                Diagnóstico Técnico
                            </h3>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Materiais Prováveis</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.technical.probable_materials.map((mat, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-lg border border-orange-100 dark:border-orange-800">
                                                {mat}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">Evidência: </span> 
                                        {analysis.technical.usage_evidence}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Riscos Mapeados</h4>
                                    <ul className="space-y-2">
                                        {analysis.technical.potential_risks.map((risk, i) => (
                                            <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                                <AlertTriangle size={14} className="text-amber-500 mr-2 mt-0.5 shrink-0"/>
                                                {risk}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* 2. OPORTUNIDADE COMERCIAL */}
                        <section className="bg-gradient-to-r from-[#FF6828] to-[#E65014] hover:to-[#BF3D0B] p-6 rounded-2xl shadow-md text-white">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                                <Lightbulb size={20} className="text-yellow-200"/>
                                Oportunidade Comercial
                            </h3>
                            <p className="text-orange-50 text-lg leading-relaxed font-medium mb-6">
                                "{analysis.commercial.opportunity_summary}"
                            </p>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {analysis.commercial.key_benefits.map((benefit, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/20">
                                        <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                                            <CheckCircle size={14} className="text-green-300"/> Benefício {i+1}
                                        </div>
                                        <p className="text-xs text-orange-100 leading-snug">{benefit}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                    </div>

                    {/* RIGHT COLUMN - METRICS (30%) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
                                <BarChart3 size={20} className="text-[#FF6828]"/>
                                Potencial do Lead
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold mb-1">Volume Estimado</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`h-3 w-3 rounded-full ${lead.volume_estimado === 'Alto' ? 'bg-green-500' : lead.volume_estimado === 'Médio' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200">{lead.volume_estimado}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold mb-1">Frequência de Compra</p>
                                    <p className="text-lg font-bold text-gray-800 dark:text-gray-200">{lead.frequencia_compra}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold mb-1">Substrato Principal</p>
                                    <span className="inline-block bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-md text-sm font-medium mt-1">
                                        {lead.substrato_recomendado}
                                    </span>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-800"/>

                                <div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-semibold mb-2">Produtos Sugeridos</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {lead.produtos_que_usa}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleAddLead}
                                disabled={isAdded}
                                className={`w-full mt-8 flex items-center justify-center py-4 px-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1
                                    ${isAdded 
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-none cursor-default hover:transform-none' 
                                        : 'bg-[#FF6828] text-white hover:bg-[#E65014]'
                                    }`}
                            >
                                {isAdded ? (
                                    <><CheckCircle size={20} className="mr-2"/> Lead Salvo</>
                                ) : (
                                    <><PlusCircle size={20} className="mr-2"/> Adicionar ao Funil</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
