
import { User, UserRole, UserStatus, Company, CompanyStatus, AccessLog } from '../types';

const STORAGE_KEYS = {
  USERS: 'hunter_saas_users_v2',
  COMPANIES: 'hunter_saas_companies_v2'
};

const CYCLE_DAYS = 30;

// Inicializa dados Master se estiverem vazios
const initData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const adminMaster: any = {
      id: 'admin-master-01',
      companyId: null,
      nome: 'Admin Master Hunter',
      email: 'admin@leadshunter.com',
      password_mock: 'admin123',
      role: UserRole.ADMIN_MASTER,
      status: UserStatus.ACTIVE,
      billableInCurrentCycle: false,
      data_criacao: new Date().toISOString(),
      accessLogs: [],
      currentSessionId: null,
      lastSeen: null
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminMaster]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify([]));
  }
};

initData();

const getUsers = (): any[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
const getCompanies = (): Company[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPANIES) || '[]');
const saveUsers = (users: any[]) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
const saveCompanies = (companies: Company[]) => localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));

// Função Auxiliar para calcular fim de ciclo
const getNextCycleEnd = (start: Date) => {
    const end = new Date(start);
    end.setDate(end.getDate() + CYCLE_DAYS);
    return end;
};

export const login = async (email: string, password_mock: string): Promise<User> => {
  const users = getUsers();
  const companies = getCompanies();
  
  const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  const user = users[userIndex];

  if (!user || user.password_mock !== password_mock) {
    throw new Error('E-mail ou senha incorretos.');
  }

  if (user.status === UserStatus.INACTIVE) {
    throw new Error('Seu usuário foi desativado pela sua empresa.');
  }

  // Se não for Admin Master, checar status da empresa e ciclo
  if (user.role !== UserRole.ADMIN_MASTER) {
    const company = companies.find(c => c.id === user.companyId);
    if (!company) throw new Error('Empresa não vinculada.');
    
    if (company.status === CompanyStatus.PENDING) throw new Error('Sua empresa aguarda aprovação do Admin Master.');
    
    // Verificação de Ciclo e Bloqueio Automático
    const now = new Date();
    const cycleEnd = new Date(company.billingCycleEnd);
    
    if (now > cycleEnd && company.status !== CompanyStatus.BLOCKED) {
        // Simulação: se passou do ciclo e não houve "pagamento", bloqueia
        // Em um sistema real, aqui checaríamos um gateway de pagamento
        // Aqui apenas sinalizamos que o ciclo venceu
    }

    if (company.status === CompanyStatus.BLOCKED) {
        throw new Error('Acesso bloqueado por pendência financeira. Regularize sua assinatura.');
    }
  }

  // Preempção de Sessão (Derrubar login anterior)
  const newSessionId = `sess-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toISOString();

  const newLog: AccessLog = {
    id: `log-${Date.now()}`,
    timestamp,
    userAgent: navigator.userAgent,
    ip: '127.0.0.1' // Em produção pegaríamos do servidor
  };

  users[userIndex].accessLogs = [newLog, ...(users[userIndex].accessLogs || [])].slice(0, 10);
  users[userIndex].currentSessionId = newSessionId;
  users[userIndex].lastSeen = timestamp;
  
  saveUsers(users);

  const { password_mock: _, ...safeUser } = users[userIndex];
  return safeUser as User;
};

export const registerCompanyRequest = async (companyName: string, ownerName: string, email: string, password_mock: string) => {
  const users = getUsers();
  const companies = getCompanies();

  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Este e-mail já está em uso.');
  }

  const companyId = `comp-${Date.now()}`;
  const now = new Date();
  const end = getNextCycleEnd(now);

  const newCompany: Company = {
    id: companyId,
    name: companyName,
    status: CompanyStatus.PENDING,
    createdAt: now.toISOString(),
    billingCycleStart: now.toISOString(),
    billingCycleEnd: end.toISOString(),
    lastCycleClosedAt: null,
    basePrice: 50,
    userPrice: 25
  };

  const newOwner = {
    id: `user-${Date.now()}`,
    companyId: companyId,
    nome: ownerName,
    email: email,
    password_mock: password_mock,
    role: UserRole.OWNER,
    status: UserStatus.ACTIVE,
    billableInCurrentCycle: true, // Owner sempre billable
    data_criacao: now.toISOString(),
    accessLogs: [],
    currentSessionId: null,
    lastSeen: null
  };

  companies.push(newCompany);
  users.push(newOwner);

  saveCompanies(companies);
  saveUsers(users);
};

export const logout = (userId: string) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].currentSessionId = null;
    users[index].lastSeen = null;
    saveUsers(users);
  }
};

export const updateHeartbeat = (userId: string, sessionId: string) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1 && users[index].currentSessionId === sessionId) {
    users[index].lastSeen = new Date().toISOString();
    saveUsers(users);
  }
};

// --- ADMIN MASTER FUNCTIONS ---
export const masterGetAllCompanies = () => getCompanies();
export const masterGetAllUsers = () => getUsers().map(({ password_mock: _, ...u }) => u as User);

export const masterUpdateCompanyStatus = (companyId: string, status: CompanyStatus) => {
  const companies = getCompanies();
  const index = companies.findIndex(c => c.id === companyId);
  if (index !== -1) {
    companies[index].status = status;
    saveCompanies(companies);
  }
};

// --- OWNER FUNCTIONS ---
export const ownerGetUsers = (companyId: string) => {
  return getUsers().filter(u => u.companyId === companyId).map(({ password_mock: _, ...u }) => u as User);
};

export const ownerCreateUser = (companyId: string, nome: string, email: string, password_mock: string) => {
  const users = getUsers();
  if (users.some(u => u.email === email)) throw new Error('E-mail já cadastrado.');

  const newUser = {
    id: `user-${Date.now()}`,
    companyId,
    nome,
    email,
    password_mock,
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    billableInCurrentCycle: true, // Ativado na criação = faturável neste ciclo
    data_criacao: new Date().toISOString(),
    accessLogs: [],
    currentSessionId: null,
    lastSeen: null
  };
  users.push(newUser);
  saveUsers(users);
};

export const ownerToggleUserStatus = (userId: string) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    const nextStatus = users[index].status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    users[index].status = nextStatus;
    
    // REGRA ANTIFRAUDE: Se ativou, paga o ciclo inteiro
    if (nextStatus === UserStatus.ACTIVE) {
        users[index].billableInCurrentCycle = true;
    }
    
    saveUsers(users);
  }
};

export const calculateBilling = (companyId: string) => {
  const company = getCompanies().find(c => c.id === companyId);
  if (!company) return 0;
  
  const users = getUsers().filter(u => u.companyId === companyId);
  
  // Contar usuários faturáveis (billableInCurrentCycle) que não são OWNER (o owner está na base)
  const additionalUsers = users.filter(u => u.role === UserRole.USER && u.billableInCurrentCycle).length;
  
  return company.basePrice + (additionalUsers * company.userPrice);
};

// Simula Fechamento de Ciclo (Reset de flags billable)
export const masterCloseCycleManually = (companyId: string) => {
    const companies = getCompanies();
    const users = getUsers();
    
    const compIndex = companies.findIndex(c => c.id === companyId);
    if (compIndex === -1) return;

    const now = new Date();
    companies[compIndex].lastCycleClosedAt = now.toISOString();
    companies[compIndex].billingCycleStart = now.toISOString();
    companies[compIndex].billingCycleEnd = getNextCycleEnd(now).toISOString();
    
    // Resetar flags billable de todos os usuários da empresa
    // Se o usuário estiver ATIVO no início do novo ciclo, ele já começa billable=true
    users.forEach((u, idx) => {
        if (u.companyId === companyId) {
            users[idx].billableInCurrentCycle = (u.status === UserStatus.ACTIVE);
        }
    });

    saveCompanies(companies);
    saveUsers(users);
};
