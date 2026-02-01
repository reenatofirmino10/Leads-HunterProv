
import React from 'react';
import { Target, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// This matches the enum in App.tsx
enum View {
  DASHBOARD,
  PROSPECTING,
}

interface DashboardViewProps {
  setView: (view: View) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ setView }) => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="max-w-3xl">
        <div className="bg-orange-100 text-[#FF6828] rounded-full p-4 inline-block mb-6">
            <Zap className="h-16 w-16" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#111827] mb-4">
          Bem-vindo, {user?.nome.split(' ')[0]}!
        </h1>
        <div className="text-lg text-[#6B7280] mb-8 space-y-1">
          <p>Sua ferramenta de prospecção inteligente para o setor gráfico.</p>
          <p>Encontre e qualifique leads com o poder da IA.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <button
            onClick={() => setView(View.PROSPECTING)}
            className="w-full md:w-auto bg-[#FF6828] hover:bg-[#E65014] text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
          >
            <Target size={24} />
            <span>Iniciar Prospecção</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
