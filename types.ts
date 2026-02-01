
export enum ProspectType {
  COMMERCIAL = 'comercial',
  INDUSTRIAL = 'industrial',
}

export enum FunnelStatus {
  NEW = 'Novo',
  CONTACT_INITIATED = 'Contato iniciado',
  IN_CONVERSATION = 'Em conversa',
  BUDGET_SENT = 'Orçamento enviado',
  NEGOTIATION = 'Negociação',
  CLOSED = 'Fechado',
  LOST = 'Perdido',
}

export enum UserRole {
  ADMIN_MASTER = 'ADMIN_MASTER', // Dono do SaaS
  OWNER = 'OWNER',               // Dono da Empresa (Tenant)
  USER = 'USER',                // Funcionário da Empresa
}

export enum UserStatus {
  ACTIVE = 'ATIVO',
  INACTIVE = 'INATIVO',
}

// Add missing LeadPotencial type
export type LeadPotencial = 'Baixo' | 'Médio' | 'Alto';

export enum CompanyStatus {
  PENDING = 'PENDENTE',
  ACTIVE = 'ATIVO',
  BLOCKED = 'BLOQUEADO', // Bloqueio por inadimplência ou Admin Master
  SUSPENDED = 'SUSPENSO',
}

export interface AccessLog {
  id: string;
  timestamp: string;
  userAgent: string;
  ip: string;
}

export interface Company {
  id: string;
  name: string;
  status: CompanyStatus;
  createdAt: string;
  billingCycleStart: string;
  billingCycleEnd: string;
  lastCycleClosedAt: string | null;
  basePrice: number; // R$ 50.00
  userPrice: number; // R$ 25.00
}

export interface User {
  id: string;
  companyId: string | null;
  nome: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  billableInCurrentCycle: boolean; // Regra Antifraude: ativado uma vez, paga o mês todo
  data_criacao: string;
  accessLogs: AccessLog[];
  currentSessionId: string | null;
  lastSeen: string | null;
}

export interface Lead {
  id: string;
  companyId: string;
  usuario_id: string;
  nome: string;
  segmento: string;
  tipo_cliente: ProspectType;
  cidade: string;
  estado: string;
  telefone: string | null;
  instagram: string | null;
  site: string | null;
  substrato_recomendado: string;
  produtos_que_usa: string;
  volume_estimado: 'Baixo' | 'Médio' | 'Alto';
  frequencia_compra: 'Baixa' | 'Média' | 'Alta';
  status: FunnelStatus;
  observacoes: string;
  historico: string[];
  data_criacao: string;
  potencial: 'Baixo' | 'Médio' | 'Alto';
  ultima_interacao: string;
  cnpj: string | null;
  nicho: string | null;
  prioridade: boolean;
  razao_social: string | null;
  nome_fantasia: string | null;
  endereco: string | null;
  cnae: string | null;
  situacao_cadastral: string | null;
  presenca_digital: string | null;
  whatsapp: string | null;
  email_comercial: string | null;
  responsavel: string | null;
}

export interface PotentialLead {
  nome: string;
  segmento: string;
  cidade: string;
  estado: string;
  telefone: string | null;
  instagram: string | null;
  site: string | null;
  substrato_recomendado: string;
  produtos_que_usa: string;
  volume_estimado: 'Baixo' | 'Médio' | 'Alto';
  frequencia_compra: 'Baixa' | 'Média' | 'Alta';
}

export interface AISuggestions {
    nextAction: string;
    whatsappMessage: string;
    alert: string | null;
    approachTitle: string;
    lowDataTips?: string[];
}

export interface AdditionalDataSuggestions {
    suggestedPhone: string | null;
    nameVariations: string[];
    alternativeAddress: string | null;
    googleMapsSearch: string;
    associationSuggestion: string | null;
    suggestedSearchTerms: string[];
}

export interface LeadAnalysis {
  technical: {
    probable_materials: string[];
    usage_evidence: string;
    potential_risks: string[];
  };
  commercial: {
    opportunity_summary: string;
    key_benefits: string[];
  };
  scripts: {
    whatsapp: string;
    phone_pitch: string;
    email_template: string;
    objections_handling: { objection: string; response: string }[];
  };
  connections: {
    linkedin_company_url: string;
    potential_decisors: {
      name: string;
      role: string;
      linkedin_url: string;
    }[];
    influence_map: string;
  };
}

export interface VoiceCommandResult {
  prospectType: ProspectType;
  segment: string;
  city: string;
  state: string;
}

export interface Scripts {
  whatsapp: string;
  phone: string;
  email: string;
}
