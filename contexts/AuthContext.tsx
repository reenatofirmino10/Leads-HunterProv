
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Company, UserStatus, CompanyStatus, UserRole } from '../types';
import * as authService from '../services/authService';

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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshState = () => {
    const saved = localStorage.getItem('hunter_current_user_v2');
    if (saved) {
      const parsedUser = JSON.parse(saved);
      const allUsers = authService.masterGetAllUsers();
      const dbUser = allUsers.find(u => u.id === parsedUser.id);
      
      // Validação de Sessão Única e Status
      if (!dbUser || dbUser.currentSessionId !== parsedUser.currentSessionId || dbUser.status === UserStatus.INACTIVE) {
        logout();
        return;
      }

      setUser(dbUser);
      localStorage.setItem('hunter_current_user_v2', JSON.stringify(dbUser));

      if (dbUser.companyId) {
        const companies = authService.masterGetAllCompanies();
        const comp = companies.find(c => c.id === dbUser.companyId);
        
        // Bloqueio Global
        if (comp && comp.status === CompanyStatus.BLOCKED && dbUser.role !== UserRole.ADMIN_MASTER) {
           logout();
           return;
        }
        setCompany(comp || null);
      }
    }
  };

  useEffect(() => {
    refreshState();
    setIsLoading(false);
  }, []);

  // Monitor Heartbeat
  useEffect(() => {
    if (!user || !user.currentSessionId) return;

    const interval = setInterval(() => {
      authService.updateHeartbeat(user.id, user.currentSessionId!);
      
      const allUsers = authService.masterGetAllUsers();
      const dbUser = allUsers.find(u => u.id === user.id);
      
      // Se a sessão mudou, significa que houve login em outro dispositivo
      if (!dbUser || dbUser.currentSessionId !== user.currentSessionId) {
        logout();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password_mock: string) => {
    const loggedUser = await authService.login(email, password_mock);
    setUser(loggedUser);
    localStorage.setItem('hunter_current_user_v2', JSON.stringify(loggedUser));
    
    if (loggedUser.companyId) {
        const companies = authService.masterGetAllCompanies();
        setCompany(companies.find(c => c.id === loggedUser.companyId) || null);
    }
  };

  const registerCompany = async (companyName: string, ownerName: string, email: string, password_mock: string) => {
    await authService.registerCompanyRequest(companyName, ownerName, email, password_mock);
  };

  const logout = () => {
    if (user) authService.logout(user.id);
    setUser(null);
    setCompany(null);
    localStorage.removeItem('hunter_current_user_v2');
  };

  return (
    <AuthContext.Provider value={{ user, company, isAuthenticated: !!user, isLoading, login, registerCompany, logout, refreshState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
