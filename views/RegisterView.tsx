
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crosshair, UserPlus, Loader2, Building2, ShieldCheck, Calendar, Mail } from 'lucide-react';

interface RegisterViewProps {
  onShowLogin: () => void;
}

const RegisterView: React.FC<RegisterViewProps> = ({ onShowLogin }) => {
  const { registerCompany } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Como o usuário removeu os campos de Nome e Senha, usamos valores padrão/derivados
      // O Owner Name assume o nome da empresa, e geramos uma senha temporária
      const derivedOwnerName = companyName; 
      const defaultPassword = 'changeMe123!'; 

      await registerCompany(companyName, derivedOwnerName, email, defaultPassword);
      setSuccess('Solicitação enviada! O Admin Master validará sua empresa em breve.');
      setTimeout(onShowLogin, 4000);
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-gray-950 text-[#111827] dark:text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-block bg-orange-50 dark:bg-orange-900/20 p-5 rounded-3xl">
            <Crosshair className="text-[#FF6828] h-10 w-10 mx-auto" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Leads<span className="text-[#FF6828]">Hunter</span></h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Cadastre sua Empresa</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome da Gráfica / Empresa</label>
            <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required placeholder="Ex: Gráfica Premium"
                   className="w-full h-14 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 text-sm ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-[#FF6828] transition-all" />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">E-mail Profissional</label>
            <div className="relative">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com"
                       className="w-full h-14 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 text-sm ring-1 ring-gray-100 dark:ring-gray-800 focus:ring-2 focus:ring-[#FF6828] transition-all" />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
          
          {/* BOX DO PLANO ATUALIZADO COM CORES DO SISTEMA */}
          <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-3xl space-y-3 border border-orange-100/50 dark:border-orange-900/20">
            <div className="flex items-center gap-2 text-[#FF6828] font-black text-xs uppercase tracking-tighter">
                <ShieldCheck size={16}/> Plano Hunter SaaS
            </div>
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-700 dark:text-gray-300 font-bold">Assinatura (Base + Owner)</span>
                    <span className="text-xs text-gray-900 dark:text-white font-black">R$ 50,00/mês</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Usuário Adicional</span>
                    <span className="text-[11px] text-gray-600 dark:text-gray-300 font-bold">R$ 25,00/usuário</span>
                </div>
            </div>
            <div className="pt-2 border-t border-orange-200/50 dark:border-orange-900/30 text-[9px] text-[#FF6828] font-black uppercase flex items-center gap-1.5">
                <Calendar size={10}/> Ciclo de Cobrança Rígido de 30 dias
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center font-black bg-red-50 p-3 rounded-2xl">{error}</p>}
          {success && <p className="text-xs text-green-500 text-center font-black bg-green-50 p-3 rounded-2xl">{success}</p>}

          <button type="submit" disabled={isLoading}
                  className="w-full h-16 flex items-center justify-center bg-[#FF6828] hover:bg-[#E65014] text-white font-black rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-95 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Building2 size={20} className="mr-2"/> Solicitar Acesso</>}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 font-medium">
            Já possui cadastro? <button onClick={onShowLogin} className="text-[#FF6828] font-black hover:underline">Fazer Login</button>
        </p>
      </div>
    </div>
  );
};

export default RegisterView;
