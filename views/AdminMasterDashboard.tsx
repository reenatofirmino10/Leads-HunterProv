
import React, { useState, useEffect } from 'react';
import { Company, CompanyStatus, User, UserRole } from '../types';
import * as authService from '../services/authService';
import { 
    ShieldCheck, ShieldAlert, ShieldX, Building2, Users, 
    Check, X, DollarSign, Clock, LayoutDashboard, Search,
    RefreshCw, AlertCircle, Eye, Mail, UserCheck
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminMasterDashboard: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'companies' | 'users' | 'revenue'>('companies');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para o modal de usuários por empresa
  const [viewingCompanyUsers, setViewingCompanyUsers] = useState<Company | null>(null);

  const loadData = () => {
    setCompanies(authService.masterGetAllCompanies());
    setAllUsers(authService.masterGetAllUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = (id: string, status: CompanyStatus) => {
    authService.masterUpdateCompanyStatus(id, status);
    loadData();
  };

  const handleCloseCycle = (id: string) => {
      if (confirm('Deseja fechar o ciclo desta empresa agora? Isso resetará as flags de cobrança para o novo mês.')) {
          authService.masterCloseCycleManually(id);
          loadData();
      }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar usuários da empresa selecionada para o modal
  const selectedCompanyUsers = allUsers.filter(u => u.companyId === viewingCompanyUsers?.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <LayoutDashboard className="text-[#FF6828]" />
                SaaS Command Center
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Administração Master do Ecossistema Hunter</p>
        </div>
        
        <div className="flex bg-white dark:bg-gray-900 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            {[
                {id: 'companies', label: 'Empresas', icon: Building2},
                {id: 'users', label: 'Logs Globais', icon: Users},
                {id: 'revenue', label: 'Financeiro', icon: DollarSign}
            ].map((tab) => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-[#FF6828] text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                    <tab.icon size={16} />
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'companies' && (
        <div className="space-y-6">
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Filtrar por nome da empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 rounded-2xl border-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-[#FF6828] outline-none shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map(company => {
                    const billing = authService.calculateBilling(company.id);
                    const companyUsers = allUsers.filter(u => u.companyId === company.id);
                    const billableCount = companyUsers.filter(u => u.billableInCurrentCycle).length;
                    
                    const isVencido = new Date() > new Date(company.billingCycleEnd);

                    return (
                        <div key={company.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-5 group hover:shadow-xl transition-all border-l-4 border-l-[#FF6828]">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h3 className="font-extrabold text-xl text-gray-900 dark:text-white">{company.name}</h3>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock size={12}/> ID: {company.id}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    company.status === CompanyStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                                    company.status === CompanyStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {company.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 dark:border-gray-800">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Ciclo Atual</p>
                                    <p className={`text-xs font-bold ${isVencido ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                                        Expira {format(new Date(company.billingCycleEnd), 'dd/MM')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Fatura</p>
                                    <p className="text-sm font-black text-green-600">R$ {billing.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <button 
                                    onClick={() => setViewingCompanyUsers(company)}
                                    className="text-gray-500 hover:text-[#FF6828] transition-colors flex items-center gap-1.5 font-bold group/btn"
                                >
                                    <Users size={14} className="group-hover/btn:scale-110 transition-transform" /> 
                                    {billableCount} Usuários Billáveis
                                    <Eye size={12} className="ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                </button>
                                <button 
                                    onClick={() => handleCloseCycle(company.id)}
                                    className="text-[#FF6828] hover:underline flex items-center gap-1 font-bold"
                                >
                                    <RefreshCw size={12}/> Fechar Ciclo
                                </button>
                            </div>

                            <div className="flex gap-2 pt-2">
                                {company.status === CompanyStatus.PENDING && (
                                    <button onClick={() => handleUpdateStatus(company.id, CompanyStatus.ACTIVE)} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                                        <Check size={14}/> Aprovar
                                    </button>
                                )}
                                {company.status === CompanyStatus.ACTIVE && (
                                    <button onClick={() => handleUpdateStatus(company.id, CompanyStatus.BLOCKED)} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-xs hover:bg-red-600 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                                        <ShieldX size={14}/> Bloquear
                                    </button>
                                )}
                                {company.status === CompanyStatus.BLOCKED && (
                                    <button onClick={() => handleUpdateStatus(company.id, CompanyStatus.ACTIVE)} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold text-xs hover:bg-blue-600">
                                        Desbloquear
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      )}

      {/* MODAL DE USUÁRIOS POR EMPRESA */}
      {viewingCompanyUsers && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setViewingCompanyUsers(null)}>
              <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                  <div className="p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-transparent flex justify-between items-center">
                      <div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Usuários da Empresa</h3>
                        <p className="text-sm text-[#FF6828] font-bold uppercase tracking-widest">{viewingCompanyUsers.name}</p>
                      </div>
                      <button onClick={() => setViewingCompanyUsers(null)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                          <X size={24} className="text-gray-400" />
                      </button>
                  </div>
                  
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                      {selectedCompanyUsers.length === 0 ? (
                          <div className="py-12 text-center text-gray-400 font-medium">
                              Nenhum usuário cadastrado nesta empresa.
                          </div>
                      ) : (
                          <div className="space-y-3">
                              {selectedCompanyUsers.map(u => (
                                  <div key={u.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 group hover:border-[#FF6828]/30 transition-all">
                                      <div className="flex items-center gap-4">
                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${u.status === 'ATIVO' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                                              {u.nome.charAt(0)}
                                          </div>
                                          <div>
                                              <p className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                                                  {u.nome}
                                                  {u.role === UserRole.OWNER && (
                                                      <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black uppercase">Owner</span>
                                                  )}
                                              </p>
                                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                                  <Mail size={10} /> {u.email}
                                              </p>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className="flex items-center justify-end gap-2 mb-1">
                                              {u.billableInCurrentCycle ? (
                                                  <span className="flex items-center gap-1 text-[9px] text-[#FF6828] font-black uppercase">
                                                      <DollarSign size={10} /> Faturável
                                                  </span>
                                              ) : (
                                                  <span className="text-[9px] text-gray-400 font-bold uppercase">Não Faturável</span>
                                              )}
                                          </div>
                                          <span className={`text-[10px] font-black uppercase tracking-tighter ${u.status === 'ATIVO' ? 'text-green-500' : 'text-red-400'}`}>
                                              {u.status}
                                          </span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                  
                  <div className="p-6 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-[#FF6828]">
                        <AlertCircle size={20} />
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed font-bold uppercase tracking-tight">
                        Nota: Usuários marcados como <span className="text-[#FF6828]">Faturáveis</span> serão cobrados no fechamento do ciclo atual de 30 dias, independente do status de ativação no momento.
                      </p>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-5">Usuário / Tenant</th>
                            <th className="px-6 py-5">Status / Billable</th>
                            <th className="px-6 py-5">Último Visto</th>
                            <th className="px-6 py-5">Sessão Ativa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {allUsers.filter(u => u.role !== UserRole.ADMIN_MASTER).map(u => {
                            const comp = companies.find(c => c.id === u.companyId);
                            return (
                                <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                    <td className="px-6 py-5">
                                        <p className="font-black text-gray-900 dark:text-white">{u.nome}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{comp?.name || 'Sistema'}</p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${u.status === 'ATIVO' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className="text-xs font-bold">{u.status}</span>
                                        </div>
                                        {u.billableInCurrentCycle && (
                                            <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-black mt-1 inline-block uppercase">Paga no Ciclo</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                                            {u.lastSeen ? formatDistanceToNow(new Date(u.lastSeen), { addSuffix: true, locale: ptBR }) : 'Nunca'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-5">
                                        <p className="text-[10px] font-mono text-gray-400 truncate max-w-[120px]">
                                            {u.currentSessionId || 'Deslogado'}
                                        </p>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="bg-white dark:bg-gray-900 p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center space-y-6">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <DollarSign size={40} className="text-green-500" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Projeção de Faturamento</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
                Baseado em {companies.filter(c => c.status === CompanyStatus.ACTIVE).length} empresas ativas e usuários habilitados nos ciclos vigentes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 max-w-2xl mx-auto">
                <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                    <p className="text-xs font-black text-gray-400 uppercase mb-2">Total Estimado Mensal</p>
                    <p className="text-5xl font-black text-[#FF6828]">
                        R$ {companies.reduce((acc, c) => acc + authService.calculateBilling(c.id), 0).toFixed(2)}
                    </p>
                </div>
                <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                    <p className="text-xs font-black text-gray-400 uppercase mb-2">Ticket Médio / Empresa</p>
                    <p className="text-5xl font-black text-blue-600">
                        R$ {(companies.reduce((acc, c) => acc + authService.calculateBilling(c.id), 0) / (companies.length || 1)).toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminMasterDashboard;
