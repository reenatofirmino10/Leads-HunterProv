
import React, { useState } from 'react';
import { AppProvider } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { UserRole } from './types';

// Views
// Removed LoginView and RegisterView imports as they are no longer needed for direct access
import DashboardView from './views/DashboardView';
import ProspectingView from './views/ProspectingView';
import FunnelView from './views/FunnelView';
import AdminMasterDashboard from './views/AdminMasterDashboard';
import CompanyDashboard from './views/CompanyDashboard';

// Icons
import { Sun, Moon, LayoutDashboard, Target, Kanban, Building2, LogOut, Loader2, ShieldCheck } from 'lucide-react';

// Types for Navigation
enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PROSPECTING = 'PROSPECTING',
  FUNNEL = 'FUNNEL',
  ADMIN_MASTER = 'ADMIN_MASTER',
  ADMIN_COMPANY = 'ADMIN_COMPANY'
}

const AuthenticatedApp: React.FC = () => {
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF6828]" size={48} />
      </div>
    );
  }

  const handleNavClick = (view: ViewState) => {
    setCurrentView(view);
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-gray-950 text-[#111827] dark:text-gray-100 flex flex-col transition-colors duration-300">
        
        {/* === HEADER === */}
        <header className="bg-white dark:bg-gray-900 shadow-sm p-4 sticky top-0 z-50 transition-colors duration-300 border-b border-[#E5E7EB] dark:border-gray-800">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setCurrentView(ViewState.DASHBOARD)}
            >
              <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-wider">
                Leads<span className="text-[#FF6828]">Hunter</span>
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto max-w-full">
               
               <button 
                 onClick={() => handleNavClick(ViewState.DASHBOARD)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${currentView === ViewState.DASHBOARD ? 'bg-white dark:bg-gray-700 text-[#FF6828] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
               >
                 <LayoutDashboard size={16} />
                 Início
               </button>

               <button 
                 onClick={() => handleNavClick(ViewState.PROSPECTING)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${currentView === ViewState.PROSPECTING ? 'bg-white dark:bg-gray-700 text-[#FF6828] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
               >
                 <Target size={16} />
                 Prospecção
               </button>

               <button 
                 onClick={() => handleNavClick(ViewState.FUNNEL)}
                 className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${currentView === ViewState.FUNNEL ? 'bg-white dark:bg-gray-700 text-[#FF6828] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
               >
                 <Kanban size={16} />
                 Funil CRM
               </button>

               {/* Admin Tabs - Always visible for Demo Admin Master */}
               {user?.role === UserRole.OWNER && (
                  <button 
                    onClick={() => handleNavClick(ViewState.ADMIN_COMPANY)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${currentView === ViewState.ADMIN_COMPANY ? 'bg-white dark:bg-gray-700 text-[#FF6828] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  >
                    <Building2 size={16} />
                    Gestão
                  </button>
               )}

               {user?.role === UserRole.ADMIN_MASTER && (
                  <button 
                    onClick={() => handleNavClick(ViewState.ADMIN_MASTER)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${currentView === ViewState.ADMIN_MASTER ? 'bg-white dark:bg-gray-700 text-[#FF6828] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                  >
                    <ShieldCheck size={16} />
                    Master
                  </button>
               )}
            </nav>
            
            {/* User Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right mr-2">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.nome}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider">{user?.role}</p>
              </div>

              <button 
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Alternar tema"
              >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              
              <button 
                  onClick={() => window.location.reload()}
                  className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Recarregar App"
              >
                  <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* === MAIN CONTENT === */}
        <main className="flex-grow p-4 md:p-8 overflow-x-hidden max-w-[1600px] mx-auto w-full">
          {currentView === ViewState.DASHBOARD && (
            <DashboardView setView={(viewIdx) => setCurrentView(viewIdx === 1 ? ViewState.PROSPECTING : ViewState.DASHBOARD)} />
          )}
          {currentView === ViewState.PROSPECTING && <ProspectingView />}
          {currentView === ViewState.FUNNEL && <FunnelView />}
          {currentView === ViewState.ADMIN_COMPANY && <CompanyDashboard />}
          {currentView === ViewState.ADMIN_MASTER && <AdminMasterDashboard />}
        </main>
      </div>
    </AppProvider>
  );
};

const App: React.FC = () => {
  return (
      <ThemeProvider>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </ThemeProvider>
  );
};

export default App;
