
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, UserStatus, UserRole } from '../types';
import * as authService from '../services/authService';
import { 
    Users, UserPlus, CreditCard, Power, Mail, 
    ShieldCheck, AlertTriangle, Calendar, TrendingUp, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CompanyDashboard: React.FC = () => {
  const { user, company } = useAuth();
  const [companyUsers, setCompanyUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', pass: '' });

  const loadUsers = () => {
    if (user?.companyId) {
        setCompanyUsers(authService.ownerGetUsers(user.companyId));
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.companyId) return;
    try {
        authService.ownerCreateUser(user.companyId, newUser.nome, newUser.email, newUser.pass);
        setShowAddUser(false);
        setNewUser({ nome: '', email: '', pass: '' });
        loadUsers();
    } catch(err: any) {
        alert(err.message);
    }
  };

  const handleToggle = (id: string) => {
    authService.ownerToggleUserStatus(id);
    loadUsers();
  };

  const billingTotal = user?.companyId ? authService.calculateBilling(user.companyId) : 0;
  const billableUsersCount = companyUsers.filter(u => u.role === UserRole.USER && u.billableInCurrentCycle).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Painel de Gestão</h2>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                <ShieldCheck size={14} className="text-blue-500" />
                Administrador da {company?.name}
            </div>
        </div>
        
        <button 
            onClick={() => setShowAddUser(true)}
            className="group px-8 py-4 bg-[#FF6828] text-white font-black rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-[#E65014] transition-all flex items-center gap-3 transform hover:-translate-y-1"
        >
            <UserPlus size={20}/> Adicionar Novo Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* USERS MANAGEMENT */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-gray-800 bg-gray-50/30 dark:bg-transparent flex justify-between items-center">
                    <h3 className="font-black text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Users size={20} className="text-[#FF6828]"/> Colaboradores
                    </h3>
                    <span className="text-[10px] font-black uppercase text-gray-400">{companyUsers.length} cadastrados</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-gray-800/30 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Usuário</th>
                                <th className="px-6 py-4 text-center">Faturável?</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {companyUsers.map(u => (
                                <tr key={u.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                                    <td className="px-6 py-5">
                                        <p className="font-black text-gray-900 dark:text-white">{u.nome}</p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {u.billableInCurrentCycle ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black border border-green-100 uppercase">
                                                Sim
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-300">Não</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${u.status === 'ATIVO' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {u.role !== UserRole.OWNER && (
                                            <button 
                                                onClick={() => handleToggle(u.id)}
                                                className={`p-2 rounded-xl transition-all ${u.status === 'ATIVO' ? 'text-red-500 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                                title={u.status === 'ATIVO' ? 'Desativar' : 'Ativar'}
                                            >
                                                <Power size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* BILLING RULES WARNING */}
            <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-200 dark:border-amber-900/30 flex items-start gap-4">
                <AlertTriangle size={24} className="text-amber-600 shrink-0 mt-1" />
                <div className="space-y-1">
                    <h4 className="font-black text-amber-900 dark:text-amber-400 uppercase text-xs tracking-widest">Regras de Faturamento por Usuário</h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                        Qualquer usuário que esteja <strong>ATIVO em qualquer momento</strong> do ciclo mensal entra na cobrança do mês, mesmo que seja desativado antes do fechamento. Isso garante a integridade da sua conta e evita abusos de compartilhamento.
                    </p>
                </div>
            </div>
        </div>

        {/* BILLING RESUME */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-8 sticky top-24">
                <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg flex items-center gap-2"><CreditCard size={20} className="text-[#FF6828]"/> Próxima Fatura</h3>
                    <TrendingUp size={20} className="text-green-500" />
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Estimado do Ciclo</p>
                    <p className="text-5xl font-black text-[#FF6828] tracking-tighter">R$ {billingTotal.toFixed(2)}</p>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><Info size={14}/> Assinatura Base</span>
                        <span className="font-black text-gray-900 dark:text-white">R$ 50,00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 flex items-center gap-2"><Users size={14}/> Usuários Adicionais ({billableUsersCount})</span>
                        <span className="font-black text-gray-900 dark:text-white">R$ {(billableUsersCount * 25).toFixed(2)}</span>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase">
                        <Calendar size={12} />
                        Ciclo Vigente
                    </div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {format(new Date(company?.billingCycleStart || ''), 'dd/MM')} até {format(new Date(company?.billingCycleEnd || ''), 'dd/MM/yyyy')}
                    </p>
                </div>

                <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                    Faturas não liquidadas até o 1º dia do novo ciclo resultam no <strong>bloqueio automático</strong> do sistema para todos os usuários.
                </p>
            </div>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-8 border border-gray-100 dark:border-gray-800">
                <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Novo Colaborador</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Este usuário terá acesso imediato e será tarifado no ciclo atual.</p>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-5">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                        <input value={newUser.nome} onChange={e => setNewUser({...newUser, nome: e.target.value})} required className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-[#FF6828] outline-none font-medium"/>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                        <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-[#FF6828] outline-none font-medium"/>
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha Temporária</label>
                        <input type="password" value={newUser.pass} onChange={e => setNewUser({...newUser, pass: e.target.value})} required className="w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border-none ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-[#FF6828] outline-none font-medium"/>
                    </div>
                    
                    <div className="flex gap-4 pt-6">
                        <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 py-4 text-gray-500 font-black text-sm hover:bg-gray-50 rounded-2xl transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-4 bg-[#FF6828] text-white font-black rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-[#E65014]">Cadastrar</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
