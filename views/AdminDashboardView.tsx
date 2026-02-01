
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserStatus, AccessLog } from '../types';
import * as authService from '../services/authService';
import { 
    Users, ShieldCheck, ShieldAlert, ShieldX, 
    Calendar, Clock, Trash2, Search, 
    History, CheckCircle2, XCircle, AlertCircle, Laptop
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AdminDashboardView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');

  const loadData = () => {
    // FIX: Changed getAllUsers to masterGetAllUsers to match services/authService.ts
    const allUsers = authService.masterGetAllUsers();
    setUsers(allUsers);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const allLogs = useMemo(() => {
    const logs: { user: User; log: AccessLog }[] = [];
    users.forEach(u => {
      u.accessLogs?.forEach(l => {
        logs.push({ user: u, log: l });
      });
    });
    return logs.sort((a, b) => new Date(b.log.timestamp).getTime() - new Date(a.log.timestamp).getTime());
  }, [users]);

  const handleUpdateStatus = (userId: string, _status: UserStatus) => {
    // FIX: Changed updateUserStatus to ownerToggleUserStatus as it is the only status modifier in authService.ts
    authService.ownerToggleUserStatus(userId);
    loadData();
  };

  const handleDelete = (_userId: string) => {
    // FIX: Removed deleteUser as it is not implemented in services/authService.ts
    alert('Função de exclusão desativada. Use a desativação de status.');
  };

  const StatusBadge = ({ status }: { status: UserStatus }) => {
    // FIX: Updated UserStatus properties to match the enum in types.ts (ACTIVE, INACTIVE)
    const styles = {
      [UserStatus.ACTIVE]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
      [UserStatus.INACTIVE]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    const icons = {
      [UserStatus.ACTIVE]: <ShieldCheck size={12} />,
      [UserStatus.INACTIVE]: <ShieldX size={12} />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {icons[status]}
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Painel Administrativo</h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie usuários e monitore acessos ao sistema.</p>
        </div>
        
        <div className="flex bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <button 
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
                Usuários
            </button>
            <button 
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
                Logs de Acesso
            </button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text"
                        placeholder="Pesquisar por nome ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Usuário</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Último Acesso</th>
                            <th className="px-6 py-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                                            {u.nome.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{u.nome}</p>
                                            <p className="text-xs text-gray-500">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={u.status} />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    {u.accessLogs?.[0] 
                                        ? format(new Date(u.accessLogs[0].timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })
                                        : 'Nunca acessou'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {/* FIX: Syncing logic with UserStatus.ACTIVE and INACTIVE */}
                                        {u.status !== UserStatus.ACTIVE && (
                                            <button 
                                                onClick={() => handleUpdateStatus(u.id, UserStatus.ACTIVE)}
                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                                                title="Ativar"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        )}
                                        {u.status === UserStatus.ACTIVE && (
                                            <button 
                                                onClick={() => handleUpdateStatus(u.id, UserStatus.INACTIVE)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                title="Desativar"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(u.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                            title="Excluir"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      ) : (
        <div className="space-y-4">
             {allLogs.length === 0 ? (
                 <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl text-center border border-gray-100 dark:border-gray-800">
                     <History size={48} className="mx-auto text-gray-300 mb-4" />
                     <p className="text-gray-500">Nenhum log de acesso registrado.</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {allLogs.map(({ user, log }) => (
                         <div key={log.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-md transition-all">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 text-xs font-bold">
                                         {user.nome.charAt(0)}
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-gray-900 dark:text-white">{user.nome}</p>
                                         <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{user.email}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                                         <Calendar size={10} />
                                         {format(new Date(log.timestamp), "dd/MM/yyyy")}
                                     </div>
                                     <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                         <Clock size={10} />
                                         {format(new Date(log.timestamp), "HH:mm:ss")}
                                     </div>
                                 </div>
                             </div>

                             <div className="space-y-2 mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                                 <div className="flex items-center justify-between">
                                     <span className="text-[10px] text-gray-400 font-bold uppercase">Dispositivo / User Agent</span>
                                 </div>
                                 <div className="flex items-start gap-2 text-[11px] text-gray-600 dark:text-gray-400">
                                     <Laptop size={14} className="shrink-0 mt-0.5" />
                                     <span className="line-clamp-2">{log.userAgent}</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardView;
