import React, { useState, useMemo, FC } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import LeadDetailModal from '../components/LeadEditModal';
import { Lead, FunnelStatus, LeadPotencial, ProspectType } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { Plus, Search, Filter, Briefcase, Calendar, TrendingUp, CheckCircle, BarChart, Users, Star } from 'lucide-react';
import { COMMERCIAL_SEGMENTS, INDUSTRIAL_SEGMENTS } from '../constants';

// #region Helper Components defined locally due to file constraints

// FunnelStats Component
const FunnelStats: FC<{ leads: Lead[] }> = ({ leads }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        return {
            total: leads.length,
            newToday: leads.filter(l => new Date(l.data_criacao).getTime() >= todayStart).length,
            inNegotiation: leads.filter(l => l.status === FunnelStatus.NEGOTIATION).length,
            closedThisMonth: leads.filter(l => l.status === FunnelStatus.CLOSED && new Date(l.ultima_interacao).getTime() >= monthStart).length,
        };
    }, [leads]);

    const StatCard: FC<{ icon: React.ReactNode; value: number; label: string; color: string }> = ({ icon, value, label, color }) => (
        <div className={`flex-1 bg-white p-4 rounded-lg shadow-md border-l-4 ${color} flex items-center space-x-4`}>
            <div className="text-gray-500">{icon}</div>
            <div>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Users size={32} />} value={stats.total} label="Leads Totais" color="border-blue-500" />
            <StatCard icon={<Star size={32} />} value={stats.newToday} label="Novos Hoje" color="border-yellow-500" />
            <StatCard icon={<TrendingUp size={32} />} value={stats.inNegotiation} label="Em Negociação" color="border-purple-500" />
            <StatCard icon={<CheckCircle size={32} />} value={stats.closedThisMonth} label="Fechados no Mês" color="border-green-500" />
        </div>
    );
};

// AddLeadModal Component
const AddLeadModal: FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { addManualLead } = useAppContext();
    const [formData, setFormData] = useState({
        nome: '', segmento: '', cidade: '', estado: '', potencial: 'Médio' as LeadPotencial,
        tipo_cliente: ProspectType.COMMERCIAL, cnpj: '', nicho: '', telefone: '',
        instagram: '', site: '', substrato_recomendado: '', produtos_que_usa: '',
        volume_estimado: 'Médio' as LeadPotencial, frequencia_compra: 'Média' as ('Baixa' | 'Média' | 'Alta'),
        status: FunnelStatus.NEW, observacoes: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addManualLead(formData);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Adicionar Novo Lead</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="nome" placeholder="Nome da Empresa" onChange={handleChange} required className="p-2 border rounded" />
                        <input name="cnpj" placeholder="CNPJ (opcional)" onChange={handleChange} className="p-2 border rounded" />
                        <select name="segmento" onChange={handleChange} required className="p-2 border rounded">
                            <option value="">Selecione o Segmento</option>
                            {[...COMMERCIAL_SEGMENTS, ...INDUSTRIAL_SEGMENTS].sort().map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select name="potencial" onChange={handleChange} value={formData.potencial} required className="p-2 border rounded">
                            <option value="Baixo">Potencial Baixo</option>
                            <option value="Médio">Potencial Médio</option>
                            <option value="Alto">Potencial Alto</option>
                        </select>
                        <input name="cidade" placeholder="Cidade" onChange={handleChange} required className="p-2 border rounded" />
                        <input name="estado" placeholder="Estado (SP)" onChange={handleChange} required className="p-2 border rounded" maxLength={2}/>
                    </div>
                     <textarea name="observacoes" placeholder="Observações iniciais..." onChange={handleChange} className="w-full p-2 border rounded" rows={3}/>
                </form>
                 <div className="p-6 border-t mt-auto">
                    <div className="flex justify-end gap-4">
                        <button onClick={onClose} className="py-2 px-4 rounded bg-gray-200 text-gray-700">Cancelar</button>
                        <button onClick={handleSubmit} className="py-2 px-4 rounded bg-blue-600 text-white flex items-center gap-2"><Plus /> Adicionar Lead</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// #endregion

const FunnelView: React.FC = () => {
    const { leads, getLeadById } = useAppContext();
    const [detailLeadId, setDetailLeadId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Add other filter states here
    const [segmentFilter, setSegmentFilter] = useState('');
    const [potencialFilter, setPotencialFilter] = useState('');

    const handleOpenDetailModal = (leadId: string) => {
        setDetailLeadId(leadId);
    };

    const handleCloseModal = () => {
        setDetailLeadId(null);
    };

    const detailLead = detailLeadId ? getLeadById(detailLeadId) : undefined;

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            const searchMatch = searchTerm === '' || lead.nome.toLowerCase().includes(searchTerm.toLowerCase());
            const segmentMatch = segmentFilter === '' || lead.segmento === segmentFilter;
            const potencialMatch = potencialFilter === '' || lead.potencial === potencialFilter;
            return searchMatch && segmentMatch && potencialMatch;
        });
    }, [leads, searchTerm, segmentFilter, potencialFilter]);


    return (
        <div className="space-y-6">
            <FunnelStats leads={leads} />
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Funil de Prospecção</h2>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-[#2D6DF6] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center gap-2">
                    <Plus size={18}/> Adicionar Lead
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white p-4 rounded-lg shadow-md flex flex-wrap gap-4 items-center">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" size={20}/>
                    <input 
                        type="text"
                        placeholder="Pesquisar por nome do lead..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-2 pl-10 text-[#111827] placeholder:text-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#2D6DF6] focus:border-[#2D6DF6] transition-all duration-200"
                    />
                </div>
                <select value={segmentFilter} onChange={e => setSegmentFilter(e.target.value)} className="p-2 border rounded-md bg-white">
                     <option value="">Todos Segmentos</option>
                     {[...new Set(leads.map(l => l.segmento))].sort().map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                 <select value={potencialFilter} onChange={e => setPotencialFilter(e.target.value)} className="p-2 border rounded-md bg-white">
                     <option value="">Todo Potencial</option>
                     <option value="Baixo">Baixo</option>
                     <option value="Médio">Médio</option>
                     <option value="Alto">Alto</option>
                </select>
            </div>

            <KanbanBoard leads={filteredLeads} onEditLead={handleOpenDetailModal} />
            
            {detailLead && (
                <LeadDetailModal
                    lead={detailLead}
                    isOpen={!!detailLeadId}
                    onClose={handleCloseModal}
                />
            )}
            <AddLeadModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    );
};

export default FunnelView;