import React, { useState, useEffect, useCallback } from 'react';
import { Lead, AISuggestions, AdditionalDataSuggestions } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { generateLeadSuggestions, findAdditionalData } from '../services/geminiService';
import Spinner from './Spinner';
import { X, Save, Edit, Bot, AlertTriangle, Building, Tag, MapPin, Calendar, Briefcase, TrendingUp, Search, Link as LinkIcon, Building2, Workflow, ShieldCheck, Wifi, UserCircle, Phone, Mail, MessageCircle, Info, History, Star, Instagram, Globe } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadDetailModalProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, isOpen, onClose }) => {
  const { updateLead } = useAppContext();
  const [formData, setFormData] = useState<Lead>(lead);
  const [newNote, setNewNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [additionalData, setAdditionalData] = useState<AdditionalDataSuggestions | null>(null);
  const [isFindingData, setIsFindingData] = useState(false);

  useEffect(() => {
    setFormData(lead);
    setIsEditing(false);
    setAdditionalData(null); 
  }, [lead]);

  const fetchAiSuggestions = useCallback(async () => {
    setIsAiLoading(true);
    try {
        const suggestions = await generateLeadSuggestions(lead);
        setAiSuggestions(suggestions);
    } catch(e) {
        console.error("Failed to get AI suggestions", e);
        setAiSuggestions(null);
    } finally {
        setIsAiLoading(false);
    }
  }, [lead]);

  useEffect(() => {
    if (isOpen) {
        fetchAiSuggestions();
    }
  }, [isOpen, fetchAiSuggestions]);

  const handleFindAdditionalData = async () => {
    setIsFindingData(true);
    try {
        const data = await findAdditionalData(lead);
        setAdditionalData(data);
    } catch (error) {
        console.error("Failed to find additional data", error);
    } finally {
        setIsFindingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTogglePriority = () => {
    const updatedLead = { ...formData, prioridade: !formData.prioridade };
    setFormData(updatedLead);
    updateLead(updatedLead);
  };

  const handleSave = () => {
    let leadToUpdate = { ...formData };
    if (newNote.trim() !== '') {
        const timestampedNote = `${new Date().toLocaleString('pt-BR')}: ${newNote}`;
        leadToUpdate = { ...leadToUpdate, historico: [timestampedNote, ...(leadToUpdate.historico || [])]};
        setNewNote('');
    }
    updateLead(leadToUpdate);
    setFormData(leadToUpdate);
    setIsEditing(false);
  };

  if (!isOpen) return null;

  const displayValue = (value: string | null | undefined, placeholder: string = 'Não informado') => {
      return value || <span className="text-gray-400 italic">{placeholder}</span>;
  }

  const DetailItem: React.FC<{icon: React.ReactNode, label: string, value: React.ReactNode}> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="text-gray-500 mt-1 flex-shrink-0">{icon}</div>
        <div className="w-full">
            <p className="text-xs text-gray-500">{label}</p>
            <div className="text-sm font-medium text-gray-800 break-words">{value}</div>
        </div>
    </div>
  );
  
  const lowPresence = lead.presenca_digital === 'Baixa' || lead.presenca_digital === 'Quase inexistente';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-50 text-gray-800 rounded-xl shadow-2xl max-w-6xl w-full h-[95vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-white rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Building className="text-blue-700"/>
            <h2 className="text-2xl font-bold">{isEditing ? <input name="nome" value={formData.nome} onChange={handleChange} className="p-1 border rounded w-full"/> : lead.nome}</h2>
            {formData.prioridade && <Star size={20} className="text-yellow-500 fill-yellow-400"/>}
          </div>
          <div className="flex items-center gap-4">
            {isEditing ? (
              <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"><Save size={16}/> Salvar</button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition"><Edit size={16}/> Editar</button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition"><X size={24} /></button>
          </div>
        </div>
        
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-y-auto">
            {/* Left Column - Details */}
            <div className="space-y-6">
                {lowPresence && (
                    <div className="p-3 rounded-lg bg-yellow-100 text-yellow-800 flex items-start gap-3 border border-yellow-200">
                        <AlertTriangle size={24} className="flex-shrink-0 mt-0.5"/>
                        <div>
                            <h4 className="font-bold">Aviso: Presença Digital Baixa</h4>
                            <p className="text-sm">Esta empresa possui poucos dados públicos. Utilize as sugestões da IA para localizar formas alternativas de contato.</p>
                        </div>
                    </div>
                )}
                
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-lg text-[#1E3A8A] mb-4">Informações do Lead</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <DetailItem icon={<Building size={16}/>} label="Nome Fantasia" value={isEditing ? <input name="nome_fantasia" value={formData.nome_fantasia || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.nome_fantasia)}/>
                        <DetailItem icon={<Building2 size={16}/>} label="Razão Social" value={isEditing ? <input name="razao_social" value={formData.razao_social || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.razao_social)}/>
                        <DetailItem icon={<Info size={16}/>} label="CNPJ" value={isEditing ? <input name="cnpj" value={formData.cnpj || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.cnpj)}/>
                        <DetailItem icon={<Tag size={16}/>} label="Segmento" value={displayValue(formData.segmento)} />
                        <DetailItem icon={<Briefcase size={16}/>} label="Nicho" value={isEditing ? <input name="nicho" value={formData.nicho || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.nicho)}/>
                        <DetailItem icon={<Workflow size={16}/>} label="CNAE" value={isEditing ? <input name="cnae" value={formData.cnae || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.cnae, "Não encontrado automaticamente")}/>
                        <DetailItem icon={<ShieldCheck size={16}/>} label="Situação" value={isEditing ? <select name="situacao_cadastral" value={formData.situacao_cadastral || 'Ativa'} onChange={handleChange} className="p-1 border rounded w-full"><option>Ativa</option><option>Inativa</option><option>Suspensa</option></select> : displayValue(formData.situacao_cadastral, "Não disponível")} />
                        <DetailItem icon={<Wifi size={16}/>} label="Presença Digital" value={isEditing ? <select name="presenca_digital" value={formData.presenca_digital || 'Baixa'} onChange={handleChange} className="p-1 border rounded w-full"><option>Forte</option><option>Média</option><option>Baixa</option><option>Quase inexistente</option></select> : displayValue(formData.presenca_digital)} />
                        <DetailItem icon={<MapPin size={16}/>} label="Endereço" value={isEditing ? <textarea name="endereco" value={formData.endereco || ''} onChange={handleChange} className="p-1 border rounded w-full text-sm" rows={2}/> : displayValue(formData.endereco, "Não encontrado automaticamente")}/>
                        <DetailItem icon={<UserCircle size={16}/>} label="Responsável" value={isEditing ? <input name="responsavel" value={formData.responsavel || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.responsavel)}/>
                        <DetailItem icon={<Phone size={16}/>} label="Telefone" value={isEditing ? <input name="telefone" value={formData.telefone || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.telefone)}/>
                        <DetailItem icon={<MessageCircle size={16}/>} label="WhatsApp" value={isEditing ? <input name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.whatsapp)}/>
                        <DetailItem icon={<Mail size={16}/>} label="E-mail" value={isEditing ? <input name="email_comercial" value={formData.email_comercial || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.email_comercial)}/>
                        <DetailItem icon={<Globe size={16}/>} label="Website" value={isEditing ? <input name="site" value={formData.site || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.site)}/>
                        <DetailItem icon={<Instagram size={16}/>} label="Instagram" value={isEditing ? <input name="instagram" value={formData.instagram || ''} onChange={handleChange} className="p-1 border rounded w-full"/> : displayValue(formData.instagram)}/>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-lg text-[#1E3A8A] mb-3">Ações Rápidas</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <button onClick={handleTogglePriority} className={`p-2 rounded-lg flex items-center justify-center gap-2 transition ${formData.prioridade ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}><Star size={16}/> {formData.prioridade ? 'Prioritário' : 'Marcar Prioridade'}</button>
                        <a href={`tel:${formData.telefone}`} className={`p-2 rounded-lg flex items-center justify-center gap-2 transition bg-gray-100 hover:bg-gray-200 text-gray-700 ${!formData.telefone ? 'opacity-50 cursor-not-allowed' : ''}`}><Phone size={16}/> Ligar</a>
                        <a href={`https://wa.me/${formData.whatsapp}`} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-lg flex items-center justify-center gap-2 transition bg-gray-100 hover:bg-gray-200 text-gray-700 ${!formData.whatsapp ? 'opacity-50 cursor-not-allowed' : ''}`}><MessageCircle size={16}/> WhatsApp</a>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <button onClick={handleFindAdditionalData} disabled={isFindingData} className="w-full bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition hover:bg-blue-200 disabled:opacity-50">
                        {isFindingData ? <><Spinner/> Buscando...</> : <><Search size={16}/> Encontrar Dados Adicionais (IA)</>}
                    </button>
                    {additionalData && (
                        <div className="mt-4 space-y-3 text-sm">
                            <p className="font-semibold">Detetive de Dados IA:</p>
                            {additionalData.nameVariations.length > 0 && <p><strong>Variações do Nome:</strong> {additionalData.nameVariations.join(', ')}</p>}
                            {additionalData.suggestedPhone && <p><strong>Telefone Sugerido:</strong> {additionalData.suggestedPhone}</p>}
                            <p><strong>Busca no Maps:</strong> <a href={additionalData.googleMapsSearch} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Abrir link</a></p>
                            <p><strong>Termos de Busca:</strong> {additionalData.suggestedSearchTerms.map(term => `"${term}"`).join(', ')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column - History & AI */}
            <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border h-full flex flex-col">
                    <h3 className="font-bold text-lg text-[#1E3A8A] mb-4 flex items-center gap-2"><Bot size={20}/> Análise e Sugestões da IA</h3>
                    {isAiLoading ? <Spinner/> : aiSuggestions ? (
                        <div className="space-y-4 text-sm">
                            {aiSuggestions.alert && <div className="p-3 rounded-lg bg-yellow-100 text-yellow-800 flex items-start gap-2 border border-yellow-200"><AlertTriangle size={24}/>{aiSuggestions.alert}</div>}
                            
                            {aiSuggestions.lowDataTips && aiSuggestions.lowDataTips.length > 0 && (
                                <div className="p-3 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                                    <h4 className="font-bold mb-2">Dicas para Leads com Baixa Presença Digital:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {aiSuggestions.lowDataTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                    </ul>
                                </div>
                            )}

                            <div><p className="font-semibold text-gray-700">Próxima Ação Sugerida:</p><p className="text-gray-600">{aiSuggestions.nextAction}</p></div>
                            <div><p className="font-semibold text-gray-700">Mensagem WhatsApp:</p><p className="text-gray-600 italic bg-gray-100 p-2 rounded">"{aiSuggestions.whatsappMessage}"</p></div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                            Nenhuma dica encontrada automaticamente. Clique em ‘Encontrar Dados Adicionais’ para tentar novamente.
                        </p>
                    )}
                     <div className="mt-4 pt-4 border-t flex-grow flex flex-col">
                        <h3 className="font-bold text-lg text-[#1E3A8A] mb-2 flex items-center gap-2"><History size={20}/> Histórico e Anotações</h3>
                         <textarea 
                            value={newNote} 
                            onChange={e => setNewNote(e.target.value)} 
                            placeholder="Adicionar nova anotação ao histórico..." 
                            className="w-full p-3 bg-white border border-[#E5E7EB] rounded-lg shadow-sm placeholder:text-[#6B7280] text-[#111827] focus:outline-none focus:ring-1 focus:ring-blue-500 mb-2" 
                            rows={2}
                         />
                         {isEditing && <button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-md text-sm self-end mb-2">Salvar Anotação</button>}
                         <div className="bg-gray-100 rounded-lg p-3 flex-grow overflow-y-auto border min-h-[150px]">
                            {formData.historico && formData.historico.length > 0 ? (
                                formData.historico.map((entry, index) => <p key={index} className="text-xs text-gray-600 pb-2 mb-2 border-b last:border-b-0">{entry}</p>)
                            ) : ( <p className="text-xs text-gray-500 text-center mt-10">Nenhum histórico registrado.</p> )}
                         </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;