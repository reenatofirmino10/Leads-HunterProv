
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Lead, PotentialLead, FunnelStatus, ProspectType } from '../types';

interface AppContextType {
  leads: Lead[];
  addLead: (potentialLead: PotentialLead, type: ProspectType, city: string, state: string) => void;
  addManualLead: (data: Partial<Lead>) => void;
  updateLeadStatus: (leadId: string, newStatus: FunnelStatus) => void;
  updateLead: (updatedLead: Lead) => void;
  getLeadById: (leadId: string) => Lead | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Removed User dependency for public access
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('hunter_saas_leads');
    if (saved) setAllLeads(JSON.parse(saved));
  }, []);

  const saveLeads = (newLeads: Lead[]) => {
    setAllLeads(newLeads);
    localStorage.setItem('hunter_saas_leads', JSON.stringify(newLeads));
  };

  // Direct access to all leads (Single User Mode)
  const leads = allLeads;

  const addLead = useCallback((potentialLead: PotentialLead, type: ProspectType, city: string, state: string) => {
    
    const creationDate = new Date().toISOString();
    const newLead: Lead = {
      ...potentialLead,
      id: `lead-${Date.now()}`,
      companyId: 'global-company', // Default ID for public mode
      usuario_id: 'guest-user',    // Default ID for public mode
      tipo_cliente: type,
      cidade: city,
      estado: state,
      status: FunnelStatus.NEW,
      observacoes: '',
      historico: [`Prospectado em ${new Date().toLocaleString()}`],
      data_criacao: creationDate,
      potencial: potentialLead.volume_estimado,
      ultima_interacao: creationDate,
      cnpj: null,
      nicho: null,
      prioridade: false,
      razao_social: null,
      nome_fantasia: potentialLead.nome,
      endereco: null,
      cnae: null,
      situacao_cadastral: 'Ativo',
      presenca_digital: 'Média',
      whatsapp: null,
      email_comercial: null,
      responsavel: null,
    };
    
    saveLeads([...allLeads, newLead]);
  }, [allLeads]);

  const addManualLead = useCallback((data: Partial<Lead>) => {
    const creationDate = new Date().toISOString();
    
    const newLead: Lead = {
      // Default values
      id: `lead-manual-${Date.now()}`,
      companyId: 'global-company',
      usuario_id: 'guest-user',
      status: FunnelStatus.NEW,
      tipo_cliente: ProspectType.COMMERCIAL,
      historico: [`Lead criado manualmente em ${new Date().toLocaleString()}`],
      data_criacao: creationDate,
      ultima_interacao: creationDate,
      prioridade: false,
      situacao_cadastral: 'Ativo',
      presenca_digital: 'Não informada',
      // Overwrite with provided data
      ...data
    } as Lead;

    saveLeads([...allLeads, newLead]);
  }, [allLeads]);

  const updateLeadStatus = useCallback((leadId: string, newStatus: FunnelStatus) => {
    const updated = allLeads.map(l => l.id === leadId ? { 
        ...l, 
        status: newStatus, 
        ultima_interacao: new Date().toISOString(),
        historico: [`Status alterado para ${newStatus}`, ...l.historico]
    } : l);
    saveLeads(updated);
  }, [allLeads]);
  
  const updateLead = useCallback((updatedLead: Lead) => {
     const updated = allLeads.map(l => l.id === updatedLead.id ? updatedLead : l);
     saveLeads(updated);
  }, [allLeads]);

  const getLeadById = (id: string) => leads.find(l => l.id === id);

  return (
    <AppContext.Provider value={{ leads, addLead, addManualLead, updateLeadStatus, updateLead, getLeadById }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
