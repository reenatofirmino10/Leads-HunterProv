import React from 'react';
import { Lead, FunnelStatus } from '../types';
import KanbanCard from './KanbanCard';
import { FUNNEL_COLUMN_COLORS } from '../constants';

interface KanbanColumnProps {
  status: FunnelStatus;
  leads: Lead[];
  isHovered: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onEditLead: (leadId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ 
    status, leads, isHovered, onDragOver, onDragLeave, onDrop, onDragStart, onDragEnd, onEditLead 
}) => {
  const color = FUNNEL_COLUMN_COLORS[status];

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`w-80 flex-shrink-0 bg-[#F4F4F4] rounded-xl shadow-sm transition-all duration-300 ${isHovered ? 'bg-blue-100' : ''}`}
    >
      <div className={`flex justify-between items-center p-4 rounded-t-xl ${color}`}>
        <h3 className="font-bold text-white text-md uppercase tracking-wide">{status}</h3>
        <span className="bg-black/20 text-white text-sm font-bold px-3 py-1 rounded-full">
          {leads.length}
        </span>
      </div>
      <div className="p-3 space-y-3 h-full overflow-y-auto">
        {leads.map((lead) => (
          <KanbanCard key={lead.id} lead={lead} onDragStart={onDragStart} onDragEnd={onDragEnd} onEditLead={onEditLead}/>
        ))}
         {leads.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-10 border-2 border-dashed border-gray-300 rounded-lg m-2">
                Arraste leads aqui
            </div>
         )}
      </div>
    </div>
  );
};

export default KanbanColumn;