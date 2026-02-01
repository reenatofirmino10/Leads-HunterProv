import React from 'react';
import { Lead, LeadPotencial, ProspectType } from '../types';
import { MapPin, Building, MoreVertical, Calendar, Factory, Store, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanCardProps {
  lead: Lead;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onEditLead: (leadId: string) => void;
}

const PotencialIndicator: React.FC<{ potencial: LeadPotencial }> = ({ potencial }) => {
    const config = {
        'Baixo': { color: 'bg-gray-200 text-gray-700', label: 'Baixo' },
        'Médio': { color: 'bg-yellow-200 text-yellow-800', label: 'Médio' },
        'Alto': { color: 'bg-green-200 text-green-800', label: 'Alto' },
    }[potencial];
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${config.color}`}>{config.label}</span>;
};


const KanbanCard: React.FC<KanbanCardProps> = ({ lead, onDragStart, onDragEnd, onEditLead }) => {
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.add('shadow-2xl', 'scale-105', 'rotate-1');
    onDragStart(e, lead.id);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('shadow-2xl', 'scale-105', 'rotate-1');
    onDragEnd(e);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onEditLead(lead.id)}
      className="bg-white p-4 rounded-lg shadow-md cursor-pointer active:cursor-grabbing border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-gray-800 pr-2">{lead.nome}</h4>
         <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
            lead.tipo_cliente === ProspectType.INDUSTRIAL ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-800'
        }`}>
            {lead.tipo_cliente === ProspectType.INDUSTRIAL ? <Factory size={12}/> : <Store size={12}/>}
            {lead.tipo_cliente === ProspectType.INDUSTRIAL ? 'Industrial' : 'Comercial'}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{lead.segmento}</p>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center text-sm text-gray-500">
            <TrendingUp size={14} className="mr-1.5" />
            <span>Potencial:</span>
        </div>
        <PotencialIndicator potencial={lead.potencial} />
      </div>
      
      <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between text-xs text-gray-500">
        <div className="flex items-center">
            <MapPin size={12} className="mr-1.5" />
            <span>{lead.cidade}, {lead.estado}</span>
        </div>
        <div className="flex items-center">
            <Calendar size={12} className="mr-1.5" />
            <span>{formatDistanceToNow(new Date(lead.ultima_interacao), { addSuffix: true, locale: ptBR })}</span>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;