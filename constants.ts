import { FunnelStatus } from './types';

export const COMMERCIAL_SEGMENTS = [
  'Açougue', 'Mercado', 'Mercearia', 'Padaria', 'Lanchonete', 'Sorveteria',
  'Loja de cosméticos', 'Loja de roupas', 'Loja de presentes', 'Petshop',
  'Clínica estética', 'Distribuidora pequena', 'Loja de autopeças'
];

export const INDUSTRIAL_SEGMENTS = [
  'Alimentícia', 'Bebidas', 'Cosmética', 'Química', 'Limpeza', 'Plásticos',
  'Metalúrgica', 'Eletrônica', 'Têxtil', 'Cervejaria artesanal', 'Pet food',
  'Embalagens', 'Logística / atacado'
];

export const RADIUS_OPTIONS = [
    'Apenas na cidade', '5 km', '10 km', '25 km', '50 km', '100 km', 'Estado inteiro', 'Brasil inteiro'
];

export const FUNNEL_COLUMNS: FunnelStatus[] = [
  FunnelStatus.NEW,
  FunnelStatus.CONTACT_INITIATED,
  FunnelStatus.IN_CONVERSATION,
  FunnelStatus.BUDGET_SENT,
  FunnelStatus.NEGOTIATION,
  FunnelStatus.CLOSED,
  FunnelStatus.LOST,
];

export const FUNNEL_COLUMN_COLORS: Record<FunnelStatus, string> = {
    [FunnelStatus.NEW]: 'bg-[#2563EB]', // Azul principal
    [FunnelStatus.CONTACT_INITIATED]: 'bg-[#1E40AF]', // Azul profundo
    [FunnelStatus.IN_CONVERSATION]: 'bg-[#14B8A6]', // Verde água tecnológico
    [FunnelStatus.BUDGET_SENT]: 'bg-[#3B82F6]', // Azul um pouco mais claro para diferenciar
    [FunnelStatus.NEGOTIATION]: 'bg-[#F59E0B]', // Alerta
    [FunnelStatus.CLOSED]: 'bg-[#16A34A]', // Sucesso
    [FunnelStatus.LOST]: 'bg-[#DC2626]', // Erro
};