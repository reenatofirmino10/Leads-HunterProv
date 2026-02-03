
import React from 'react';
import { AppProvider } from './contexts/AppContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ProspectingView from './views/ProspectingView';
import { Sun, Moon, Search } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <AppProvider>
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-gray-950 text-[#111827] dark:text-gray-100 flex flex-col transition-colors duration-300">
        <header className="bg-white dark:bg-gray-900 shadow-sm p-4 relative flex justify-between items-center border-b border-[#E5E7EB] dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
          
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-[#111827] dark:text-white tracking-wider flex items-center">
              Leads<span className="text-[#FF6828]">Hunter</span>
            </h1>

            <nav className="hidden md:flex items-center gap-1">
               <button 
                 className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all bg-orange-50 dark:bg-orange-900/20 text-[#FF6828]"
               >
                 <Search size={18} />
                 Prospecção
               </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Alternar tema"
            >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>

        <main className="flex-grow p-4 md:p-8 overflow-x-hidden">
          <ProspectingView />
        </main>
      </div>
    </AppProvider>
  );
};

const App: React.FC = () => {
  return (
      <ThemeProvider>
        <MainLayout />
      </ThemeProvider>
  );
};

export default App;
