
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crosshair, LogIn, Loader2 } from 'lucide-react';

interface LoginViewProps {
  onShowRegister: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onShowRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-gray-950 text-[#111827] dark:text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-10">
          <div className="inline-block bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl mb-4">
            <Crosshair className="text-[#FF6828] h-10 w-10 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-[#111827] dark:text-white tracking-wider">
            Leads<span className="text-[#FF6828]">Hunter</span>
          </h1>
          <p className="text-[#6B7280] dark:text-gray-400 mt-2">Acesse sua plataforma de prospecção.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#FF6828] transition-all"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 ml-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 text-sm focus:ring-2 focus:ring-[#FF6828] transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-xl">
                <p className="text-xs text-red-600 dark:text-red-400 text-center font-bold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 flex items-center justify-center bg-[#FF6828] hover:bg-[#E65014] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <> <LogIn size={20} className="mr-2"/> Entrar </>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ainda não tem acesso?{' '}
            <button onClick={onShowRegister} className="font-bold text-[#FF6828] hover:text-[#E65014] underline">
              Crie sua conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
