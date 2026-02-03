
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Company, UserStatus, CompanyStatus, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password_mock: string) => Promise<void>;
  registerCompany: (companyName: string, ownerName: string, email: string, password_mock: string) => Promise<void>;
  logout: () => void;
  refreshState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock Data para acesso direto sem login
const MOCK_USER: User = {
  id: 'demo-user-id',
  companyId: 'demo-company-id',
  nome: 'Usuário Público',
  email: 'demo@leadshunter.com',
  role: UserRole.ADMIN_MASTER, // Acesso total
  status: UserStatus.ACTIVE,
  billableInCurrentCycle: true,
  data_criacao: new Date().toISOString(),
  accessLogs: [],
  currentSessionId: 'demo-session',
  lastSeen: new Date().toISOString()
};

const MOCK_COMPANY: Company = {
  id: 'demo-company-id',
  name: 'Gráfica Demo S.A.',
  status: CompanyStatus.ACTIVE,
  createdAt: new Date().toISOString(),
  billingCycleStart: new Date().toISOString(),
  billingCycleEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
  lastCycleClosedAt: null,
  basePrice: 50,
  userPrice: 25
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicialização automática sem login
    setUser(MOCK_USER);
    setCompany(MOCK_COMPANY);
    setIsLoading(false);
  }, []);

  // Funções dummy para manter compatibilidade com componentes que chamam login/logout
  const login = async () => {}; 
  const registerCompany = async () => {};
  const logout = () => {
    // Em modo demo, logout apenas recarrega a página
    window.location.reload();
  };
  const refreshState = () => {};

  return (
    <AuthContext.Provider value={{ 
      user, 
      company, 
      isAuthenticated: true, // Sempre autenticado
      isLoading, 
      login, 
      registerCompany, 
      logout, 
      refreshState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
