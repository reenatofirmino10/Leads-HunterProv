import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { FUNNEL_COLUMNS } from '../constants';
import { FunnelStatus, Lead } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  onEditLead: (leadId: string) => void;
  leads: Lead[];
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onEditLead, leads }) => {
  const { updateLeadStatus } = useAppContext();
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<FunnelStatus | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: FunnelStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredColumn(status);
  };

  const handleDragLeave = () => {
    setHoveredColumn(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: FunnelStatus) => {
    e.preventDefault();
    if (draggedItemId) {
      updateLeadStatus(draggedItemId, newStatus);
    }
    setDraggedItemId(null);
    setHoveredColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setHoveredColumn(null);
  }

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
      {FUNNEL_COLUMNS.map((status) => {
        const columnLeads = leads.filter((lead) => lead.status === status);
        return (
          <KanbanColumn
            key={status}
            status={status}
            leads={columnLeads}
            isHovered={hoveredColumn === status}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onEditLead={onEditLead}
          />
        );
      })}
    </div>
  );
};

export default KanbanBoard;