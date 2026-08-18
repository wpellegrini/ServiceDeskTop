// ─────────────────────────────────────────────────────────────
// NimbusDesk · camada de dados (domínio + massa de demonstração)
// ─────────────────────────────────────────────────────────────

export type Role = "usuario" | "tecnico" | "admin";
export type TicketStatus =
  | "novo"
  | "triagem"
  | "atendimento"
  | "aguardando_usuario"
  | "aguardando_terceiro"
  | "aguardando_aprovacao"
  | "desenvolvimento"
  | "homologacao"
  | "resolvido"
  | "encerrado"
  | "cancelado";
export type Priority = "P1" | "P2" | "P3" | "P4";
export type Level = 1 | 2 | 3 | 4;

export interface Unit {
  id: string;
  name: string;
  city: string;
  address: string;
  manager: string;
  phone: string;
  hours: string;
}
export interface Team {
  id: string;
  name: string;
  lead: string;
  color: string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  unitId: string;
  dept: string;
  title: string;
  teamId?: string;
  specialties?: string[];
  active: boolean;
  online?: boolean;
  color: string;
}
export interface Service {
  id: string;
  name: string;
  desc: string;
  teamId: string;
  frH: number;
  resH: number;
  approval?: boolean;
}
export interface Category {
  id: string;
  name: string;
  desc: string;
  hue: string;
  services: Service[];
}
export interface Asset {
  id: string;
  tag: string;
  type: string;
  maker: string;
  model: string;
  serial: string;
  userId?: string;
  unitId: string;
  status: "em uso" | "disponível" | "manutenção" | "inservível";
  warranty: string;
  supplier: string;
  location: string;
}
export interface Article {
  id: string;
  title: string;
  catId: string;
  keywords: string[];
  summary: string;
  body: string[];
  steps?: string[];
  author: string;
  updatedAt: number;
  views: number;
  version: string;
}
export interface Attachment {
  name: string;
  size: string;
  kind: "img" | "doc" | "pdf";
}
export interface TicketEvent {
  id: string;
  at: number;
  by: string;
  kind:
    | "create"
    | "status"
    | "assign"
    | "comment"
    | "priority"
    | "sla"
    | "reopen"
    | "approval"
    | "rate"
    | "link"
    | "attachment";
  text: string;
}
export interface TicketMessage {
  id: string;
  at: number;
  by: string;
  kind: "user" | "reply" | "internal" | "system";
  text: string;
}
export interface Rating {
  stars: number;
  resolved: boolean;
  comment?: string;
}
export interface Approval {
  required: boolean;
  state: "pendente" | "aprovado" | "rejeitado";
  by?: string;
}
export interface Ticket {
  id: string;
  code: string;
  title: string;
  description: string;
  serviceId: string;
  catId: string;
  unitId: string;
  requesterId: string;
  techId?: string;
  teamId?: string;
  status: TicketStatus;
  priority: Priority;
  impact: Level;
  urgency: Level;
  createdAt: number;
  updatedAt: number;
  frDue: number;
  resDue: number;
  frAt?: number;
  resolvedAt?: number;
  closedAt?: number;
  assetId?: string;
  attachments: Attachment[];
  events: TicketEvent[];
  messages: TicketMessage[];
  rating?: Rating;
  reopenCount: number;
  relatedIds: string[];
  parentId?: string;
  approval?: Approval;
  solution?: string;
}
export interface Notif {
  id: string;
  at: number;
  forRole: Role | "all";
  forUser?: string;
  text: string;
  kind: "abertura" | "atribuicao" | "comentario" | "sla" | "resolucao" | "info" | "sistema";
  read: boolean;
  ticketId?: string;
}
export interface AuditEntry {
  id: string;
  at: number;
  user: string;
  op: string;
  entity: string;
  before: string;
  after: string;
  ip: string;
}
export interface SlaRule {
  id: string;
  priority: Priority;
  scope: string;
  frMin: number;
  resMin: number;
}

// ── helpers de tempo ─────────────────────────────────────────
export const NOW = Date.now();
const H = 3600_000;
const M = 60_000;
export const ago = (hours: number) => NOW - hours * H;
export const ahead = (hours: number) => NOW + hours * H;

export function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  if (d < M) return "agora";
  if (d < H) return `há ${Math.floor(d / M)} min`;
  if (d < 24 * H) return `há ${Math.floor(d / H)} h`;
  if (d < 7 * 24 * H) return `há ${Math.floor(d / (24 * H))} d`;
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}
export function fmtDT(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
export function fmtD(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
export function fmtDur(ms: number): string {
  const abs = Math.abs(ms);
  const d = Math.floor(abs / (24 * H));
  const h = Math.floor((abs % (24 * H)) / H);
  const m = Math.floor((abs % H) / M);
  if (d > 0) return `${d}d ${String(h).padStart(2, "0")}h`;
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}`;
  return `${m}min`;
}

// ── metadados de domínio ─────────────────────────────────────
export const STATUS_META: Record<TicketStatus, { label: string; pill: string; dot: string }> = {
  novo: { label: "Novo", pill: "bg-skyx-100 text-skyx-600", dot: "bg-skyx-600" },
  triagem: { label: "Em triagem", pill: "bg-pine-100 text-pine-700", dot: "bg-pine-600" },
  atendimento: { label: "Em atendimento", pill: "bg-brand-100 text-brand-700", dot: "bg-brand-600" },
  aguardando_usuario: { label: "Aguard. usuário", pill: "bg-warn-100 text-warn-600", dot: "bg-warn-500" },
  aguardando_terceiro: { label: "Aguard. terceiro", pill: "bg-amberx-100 text-amberx-600", dot: "bg-amberx-500" },
  aguardando_aprovacao: { label: "Aguard. aprovação", pill: "bg-plum-100 text-plum-600", dot: "bg-plum-600" },
  desenvolvimento: { label: "Em desenvolvimento", pill: "bg-pine-100 text-pine-700", dot: "bg-pine-600" },
  homologacao: { label: "Em homologação", pill: "bg-brand-100 text-brand-700", dot: "bg-brand-500" },
  resolvido: { label: "Resolvido", pill: "bg-ok-100 text-ok-600", dot: "bg-ok-500" },
  encerrado: { label: "Encerrado", pill: "bg-[#e5eae8] text-ink-soft", dot: "bg-ink-faint" },
  cancelado: { label: "Cancelado", pill: "bg-danger-100 text-danger-600", dot: "bg-danger-500" },
};

export const PRIORITY_META: Record<Priority, { label: string; pill: string; ring: string }> = {
  P1: { label: "P1 · Crítica", pill: "bg-danger-100 text-danger-600", ring: "border-danger-500" },
  P2: { label: "P2 · Alta", pill: "bg-amberx-100 text-amberx-600", ring: "border-amberx-500" },
  P3: { label: "P3 · Média", pill: "bg-warn-100 text-warn-600", ring: "border-warn-500" },
  P4: { label: "P4 · Baixa", pill: "bg-[#e5eae8] text-ink-soft", ring: "border-line-strong" },
};

export const IMPACTS: Record<Level, string> = { 1: "Baixo", 2: "Médio", 3: "Alto", 4: "Crítico" };
export const URGENCIES: Record<Level, string> = { 1: "Baixa", 2: "Média", 3: "Alta", 4: "Crítica" };

const MATRIX: Priority[][] = [
  ["P4", "P4", "P3", "P2"],
  ["P4", "P3", "P3", "P2"],
  ["P3", "P3", "P2", "P1"],
  ["P2", "P2", "P1", "P1"],
];
export function matrixPriority(impact: Level, urgency: Level): Priority {
  return MATRIX[impact - 1][urgency - 1];
}

export type SlaState = "ok" | "warn" | "over" | "paused" | "done";
export function slaState(t: Ticket): SlaState {
  if (["resolvido", "encerrado", "cancelado"].includes(t.status)) return "done";
  if (t.status === "aguardando_usuario") return "paused";
  const left = t.resDue - Date.now();
  if (left < 0) return "over";
  if (left <= 4 * H) return "warn";
  return "ok";
}
export const SLA_LABEL: Record<SlaState, string> = {
  ok: "Dentro do SLA",
  warn: "Próximo do vencimento",
  over: "SLA vencido",
  paused: "SLA pausado",
  done: "SLA finalizado",
};

// ── cadastro base ────────────────────────────────────────────
export const UNITS: Unit[] = [
  { id: "u1", name: "Matriz São Paulo", city: "São Paulo", address: "Av. Paulista, 1439 · 8º andar", manager: "Carla Mendes", phone: "(11) 3222-0100", hours: "08h–18h" },
  { id: "u2", name: "Filial Campinas", city: "Campinas", address: "R. Barão de Itapura, 900", manager: "Otávio Ramos", phone: "(19) 3777-0200", hours: "08h–18h" },
  { id: "u3", name: "CD Jundiaí", city: "Jundiaí", address: "Rod. Anhanguera, km 42", manager: "Sérgio Vidal", phone: "(11) 4555-0300", hours: "24×7" },
  { id: "u4", name: "Escritório Curitiba", city: "Curitiba", address: "R. XV de Novembro, 556", manager: "Helena Costa", phone: "(41) 3333-0400", hours: "08h–18h" },
];

export const TEAMS: Team[] = [
  { id: "t1", name: "Suporte Técnico N1", lead: "Rafael Souza", color: "#12897e" },
  { id: "t2", name: "Infraestrutura", lead: "Bianca Rocha", color: "#226a7a" },
  { id: "t3", name: "Sistemas", lead: "Diego Nunes", color: "#c07d17" },
  { id: "t4", name: "Desenvolvimento", lead: "Marcos Tanaka", color: "#8a4f9e" },
  { id: "t5", name: "Segurança", lead: "Luiza Prado", color: "#b23a3a" },
];

export const USERS: User[] = [
  { id: "p1", name: "João Almeida", email: "joao.almeida@vetra.com.br", role: "usuario", unitId: "u1", dept: "Financeiro", title: "Analista Financeiro", active: true, online: true, color: "#12897e" },
  { id: "p2", name: "Carla Mendes", email: "carla.mendes@vetra.com.br", role: "admin", unitId: "u1", dept: "TI", title: "Coordenadora de TI", active: true, online: true, color: "#8a4f9e" },
  { id: "p3", name: "Rafael Souza", email: "rafael.souza@vetra.com.br", role: "tecnico", unitId: "u1", dept: "TI", title: "Técnico de Suporte", teamId: "t1", specialties: ["Hardware", "M365", "Rede"], active: true, online: true, color: "#c07d17" },
  { id: "p4", name: "Bianca Rocha", email: "bianca.rocha@vetra.com.br", role: "tecnico", unitId: "u1", dept: "TI", title: "Analista de Infraestrutura", teamId: "t2", specialties: ["Rede", "Servidores", "VPN"], active: true, online: false, color: "#226a7a" },
  { id: "p5", name: "Diego Nunes", email: "diego.nunes@vetra.com.br", role: "tecnico", unitId: "u1", dept: "TI", title: "Analista de Sistemas", teamId: "t3", specialties: ["ERP", "Integrações"], active: true, online: true, color: "#2b6cb0" },
  { id: "p6", name: "Luiza Prado", email: "luiza.prado@vetra.com.br", role: "tecnico", unitId: "u1", dept: "TI", title: "Analista de Segurança", teamId: "t5", specialties: ["Phishing", "Malware", "SIEM"], active: true, online: false, color: "#b23a3a" },
  { id: "p7", name: "Marcos Tanaka", email: "marcos.tanaka@vetra.com.br", role: "tecnico", unitId: "u1", dept: "TI", title: "Desenvolvedor", teamId: "t4", specialties: ["APIs", "Relatórios"], active: true, online: true, color: "#8a4f9e" },
  { id: "p8", name: "Paula Freitas", email: "paula.freitas@vetra.com.br", role: "tecnico", unitId: "u2", dept: "TI", title: "Técnica de Suporte", teamId: "t1", specialties: ["Hardware", "Impressoras"], active: true, online: true, color: "#1f7d53" },
  { id: "p9", name: "Fernanda Dias", email: "fernanda.dias@vetra.com.br", role: "usuario", unitId: "u2", dept: "Comercial", title: "Executiva de Vendas", active: true, online: false, color: "#c07d17" },
  { id: "p10", name: "Otávio Ramos", email: "otavio.ramos@vetra.com.br", role: "usuario", unitId: "u3", dept: "Logística", title: "Supervisor de Logística", active: true, online: true, color: "#2b6cb0" },
  { id: "p11", name: "Helena Costa", email: "helena.costa@vetra.com.br", role: "usuario", unitId: "u4", dept: "RH", title: "Coordenadora de RH", active: true, online: false, color: "#b23a3a" },
  { id: "p12", name: "Sérgio Vidal", email: "sergio.vidal@vetra.com.br", role: "usuario", unitId: "u1", dept: "Operações", title: "Gerente de Operações", active: true, online: true, color: "#226a7a" },
];

export const CATEGORIES: Category[] = [
  {
    id: "acessos", name: "Acessos e Identidade", desc: "Usuários, senhas, permissões e desbloqueios", hue: "#2b6cb0",
    services: [
      { id: "s-criar-usuario", name: "Criação de usuário", desc: "Novo colaborador precisa de conta e e-mail", teamId: "t1", frH: 4, resH: 24, approval: true },
      { id: "s-senha", name: "Redefinição de senha", desc: "Esqueci minha senha ou conta bloqueada por tentativas", teamId: "t1", frH: 1, resH: 4 },
      { id: "s-desbloqueio", name: "Desbloqueio de usuário", desc: "Conta bloqueada no Active Directory", teamId: "t1", frH: 1, resH: 4 },
      { id: "s-acesso-sistema", name: "Acesso a sistemas", desc: "Solicitar acesso ao ERP, CRM e demais sistemas", teamId: "t3", frH: 4, resH: 24, approval: true },
      { id: "s-pastas", name: "Acesso a pastas de rede", desc: "Permissão em pastas compartilhadas", teamId: "t2", frH: 4, resH: 24, approval: true },
      { id: "s-permissoes", name: "Solicitação de permissões", desc: "Perfis e papéis em sistemas corporativos", teamId: "t3", frH: 4, resH: 24, approval: true },
    ],
  },
  {
    id: "hardware", name: "Computadores e Equipamentos", desc: "Desktops, notebooks, periféricos e acessórios", hue: "#12897e",
    services: [
      { id: "s-pc", name: "Computador com problema", desc: "Não liga, reinicia, trava ou faz barulho", teamId: "t1", frH: 2, resH: 8 },
      { id: "s-notebook", name: "Notebook", desc: "Bateria, teclado, tela ou desempenho", teamId: "t1", frH: 2, resH: 8 },
      { id: "s-monitor", name: "Monitor", desc: "Sem vídeo, piscando ou com manchas", teamId: "t1", frH: 4, resH: 24 },
      { id: "s-perifericos", name: "Teclado / Mouse / Webcam / Headset", desc: "Periféricos com defeito ou não reconhecidos", teamId: "t1", frH: 4, resH: 24 },
      { id: "s-outro-eq", name: "Outros equipamentos", desc: "Leitor de código, coletor, nobreak etc.", teamId: "t2", frH: 4, resH: 24 },
    ],
  },
  {
    id: "sistemas", name: "Sistemas Corporativos", desc: "ERP, CRM e sistemas internos", hue: "#c07d17",
    services: [
      { id: "s-erro-sistema", name: "Erro em sistema", desc: "Mensagem de erro ao executar uma operação", teamId: "t3", frH: 1, resH: 8 },
      { id: "s-lentidao", name: "Lentidão em sistema", desc: "Tempo de resposta acima do normal", teamId: "t3", frH: 2, resH: 8 },
      { id: "s-duvida", name: "Dúvida de utilização", desc: "Como executar um procedimento no sistema", teamId: "t3", frH: 4, resH: 24 },
      { id: "s-integracao", name: "Integração entre sistemas", desc: "Dados não sincronizam entre sistemas", teamId: "t4", frH: 4, resH: 48 },
      { id: "s-relatorio", name: "Relatórios", desc: "Erro ou divergência em relatórios gerados", teamId: "t3", frH: 4, resH: 24 },
    ],
  },
  {
    id: "m365", name: "Microsoft 365", desc: "Outlook, Teams, OneDrive, SharePoint e Office", hue: "#b23a3a",
    services: [
      { id: "s-outlook", name: "Outlook", desc: "E-mail não envia, recebe ou sincroniza", teamId: "t1", frH: 1, resH: 4 },
      { id: "s-teams", name: "Teams", desc: "Reuniões, mensagens ou canais com problema", teamId: "t1", frH: 2, resH: 8 },
      { id: "s-onedrive", name: "OneDrive / SharePoint", desc: "Sincronização, compartilhamento ou permissões", teamId: "t2", frH: 4, resH: 24 },
      { id: "s-office", name: "Office", desc: "Word, Excel ou PowerPoint com erro ou sem licença", teamId: "t1", frH: 4, resH: 24 },
      { id: "s-conta-m365", name: "Conta Microsoft 365", desc: "Licenças, caixa compartilhada, grupos", teamId: "t2", frH: 4, resH: 24, approval: true },
    ],
  },
  {
    id: "rede", name: "Rede e Internet", desc: "Wi-Fi, VPN, links e conectividade", hue: "#226a7a",
    services: [
      { id: "s-wifi", name: "Wi-Fi", desc: "Sem conexão ou queda constante no Wi-Fi", teamId: "t2", frH: 1, resH: 4 },
      { id: "s-internet", name: "Internet", desc: "Link lento ou indisponível na unidade", teamId: "t2", frH: 1, resH: 4 },
      { id: "s-vpn", name: "VPN", desc: "Não conecta ou cai com frequência", teamId: "t2", frH: 1, resH: 8 },
      { id: "s-cabo", name: "Conexão de rede cabeada", desc: "Porta sem rede ou instável", teamId: "t2", frH: 2, resH: 8 },
      { id: "s-externo", name: "Acesso externo", desc: "Acessar sistemas fora da empresa", teamId: "t2", frH: 2, resH: 8 },
    ],
  },
  {
    id: "telefonia", name: "Telefonia", desc: "Ramais, celulares corporativos e softphone", hue: "#8a4f9e",
    services: [
      { id: "s-ramal", name: "Ramal", desc: "Ramal mudo, sem linha ou mal configurado", teamId: "t2", frH: 4, resH: 24 },
      { id: "s-telefone", name: "Telefone", desc: "Aparelho com defeito", teamId: "t2", frH: 4, resH: 24 },
      { id: "s-celular", name: "Celular corporativo", desc: "Chip, aparelho ou plano", teamId: "t1", frH: 4, resH: 24, approval: true },
      { id: "s-softphone", name: "Softphone", desc: "Aplicativo de voz no computador", teamId: "t2", frH: 4, resH: 24 },
    ],
  },
  {
    id: "impressao", name: "Impressoras", desc: "Impressão, suprimentos e instalação", hue: "#1f7d53",
    services: [
      { id: "s-erro-imp", name: "Erro de impressão", desc: "Fila parada, erro de driver ou página em branco", teamId: "t1", frH: 2, resH: 8 },
      { id: "s-inst-imp", name: "Instalação de impressora", desc: "Instalar impressora em nova estação", teamId: "t1", frH: 4, resH: 24 },
      { id: "s-toner", name: "Toner / Suprimentos", desc: "Solicitar troca de toner ou cilindro", teamId: "t1", frH: 8, resH: 48 },
      { id: "s-conf-imp", name: "Configuração", desc: "Digitalização para pasta/e-mail, crachá", teamId: "t1", frH: 4, resH: 24 },
    ],
  },
  {
    id: "seguranca", name: "Segurança da Informação", desc: "Phishing, malware e incidentes", hue: "#b23a3a",
    services: [
      { id: "s-phishing", name: "E-mail suspeito / Phishing", desc: "Recebi um e-mail que parece fraudulento", teamId: "t5", frH: 0.25, resH: 4 },
      { id: "s-virus", name: "Vírus / Malware", desc: "Máquina infectada ou comportamento estranho", teamId: "t5", frH: 0.5, resH: 8 },
      { id: "s-indevido", name: "Acesso indevido", desc: "Suspeita de acesso não autorizado", teamId: "t5", frH: 0.5, resH: 8 },
      { id: "s-incidente", name: "Incidente de segurança", desc: "Vazamento de dados ou violação de política", teamId: "t5", frH: 0.25, resH: 4 },
    ],
  },
  {
    id: "dev", name: "Sistemas e Desenvolvimento", desc: "Melhorias, correções e novas funcionalidades", hue: "#8a4f9e",
    services: [
      { id: "s-correcao", name: "Correção de sistema", desc: "Bug identificado em sistema próprio", teamId: "t4", frH: 8, resH: 72 },
      { id: "s-melhoria", name: "Melhoria", desc: "Otimização de funcionalidade existente", teamId: "t4", frH: 8, resH: 72 },
      { id: "s-nova-func", name: "Nova funcionalidade", desc: "Desenvolvimento de novo recurso", teamId: "t4", frH: 24, resH: 168, approval: true },
      { id: "s-api", name: "Integração via API", desc: "Integrar sistemas internos ou externos", teamId: "t4", frH: 24, resH: 168, approval: true },
      { id: "s-dashboard", name: "Relatório / Dashboard", desc: "Novo painel ou relatório gerencial", teamId: "t4", frH: 24, resH: 168, approval: true },
    ],
  },
];

export const ALL_SERVICES: { service: Service; cat: Category }[] = CATEGORIES.flatMap((cat) =>
  cat.services.map((service) => ({ service, cat })),
);
export const serviceById = (id?: string) => ALL_SERVICES.find((s) => s.service.id === id);
export const catById = (id?: string) => CATEGORIES.find((c) => c.id === id);
export const unitById = (id?: string) => UNITS.find((u) => u.id === id);
export const userById = (id?: string) => USERS.find((u) => u.id === id);
export const teamById = (id?: string) => TEAMS.find((t) => t.id === id);

export const ASSETS: Asset[] = [
  { id: "a1", tag: "PAT-0142", type: "Notebook", maker: "Dell", model: "Latitude 5440", serial: "DL5440-8871-BR", userId: "p1", unitId: "u1", status: "em uso", warranty: "2027-03-15", supplier: "Dell Brasil", location: "Matriz · 8º andar · Mesa 24" },
  { id: "a2", tag: "PAT-0157", type: "Notebook", maker: "Lenovo", model: "ThinkPad E14", serial: "LNV-E14-2210", userId: "p9", unitId: "u2", status: "em uso", warranty: "2026-11-02", supplier: "Lenovo", location: "Campinas · Vendas · Mesa 07" },
  { id: "a3", tag: "PAT-0098", type: "Desktop", maker: "Lenovo", model: "ThinkCentre M75", serial: "LNV-M75-5541", userId: "p10", unitId: "u3", status: "em uso", warranty: "2026-08-20", supplier: "Lenovo", location: "Jundiaí · Docas · Sala 02" },
  { id: "a4", tag: "PAT-0201", type: "Monitor", maker: "LG", model: "24MK430", serial: "LG24-99812", userId: "p1", unitId: "u1", status: "em uso", warranty: "2026-05-30", supplier: "LG do Brasil", location: "Matriz · 8º andar · Mesa 24" },
  { id: "a5", tag: "PAT-0310", type: "Impressora", maker: "HP", model: "LaserJet M404dn", serial: "HPM404-77120", unitId: "u1", status: "em uso", warranty: "2026-09-12", supplier: "HP Brasil", location: "Matriz · 7º andar · Copa" },
  { id: "a6", tag: "PAT-0023", type: "Switch", maker: "Cisco", model: "Catalyst 9200", serial: "CSC-9200-0031", unitId: "u2", status: "manutenção", warranty: "2028-01-10", supplier: "Cisco", location: "Campinas · Rack TI" },
  { id: "a7", tag: "PAT-0007", type: "Firewall", maker: "Fortinet", model: "FortiGate 60F", serial: "FG60F-88213", unitId: "u1", status: "em uso", warranty: "2027-12-01", supplier: "Fortinet", location: "Matriz · Datacenter" },
  { id: "a8", tag: "PAT-0266", type: "Celular", maker: "Apple", model: "iPhone 13", serial: "APL-I13-4419", userId: "p12", unitId: "u1", status: "em uso", warranty: "2026-07-19", supplier: "Apple", location: "Em campo" },
  { id: "a9", tag: "PAT-0289", type: "Tablet", maker: "Samsung", model: "Galaxy Tab S8", serial: "SMS-S8-3302", unitId: "u3", status: "disponível", warranty: "2026-10-05", supplier: "Samsung", location: "Jundiaí · Almoxarifado" },
  { id: "a10", tag: "PAT-0344", type: "Notebook", maker: "HP", model: "ProBook 450", serial: "HP-450-6620", unitId: "u4", status: "manutenção", warranty: "2026-04-18", supplier: "HP Brasil", location: "Curitiba · RH · Bancada TI" },
];
export const assetById = (id?: string) => ASSETS.find((a) => a.id === id);

// ── Base de Conhecimento ─────────────────────────────────────
export const ARTICLES: Article[] = [
  {
    id: "kb1", title: "Como conectar ao Wi-Fi corporativo", catId: "rede",
    keywords: ["wi-fi", "wifi", "conectar", "rede", "sem fio", "internet", "ssid"],
    summary: "Passo a passo para conectar notebook ou celular à rede Vetra-Corp com certificado.",
    body: [
      "A rede corporativa utiliza autenticação por certificado (WPA2-Enterprise). Siga os passos abaixo de acordo com o seu sistema operacional.",
      "Se a rede Vetra-Corp não aparecer na lista, verifique se o modo avião está desligado e reinicie o adaptador de rede.",
    ],
    steps: [
      "Selecione a rede Vetra-Corp na lista de redes disponíveis",
      "Digite seu usuário de rede (sem o domínio) e a senha atual",
      "Aceite o certificado quando solicitado (Vetra-CA-2024)",
      "Aguarde a validação — a conexão leva até 30 segundos",
    ],
    author: "Bianca Rocha", updatedAt: ago(24 * 21), views: 1243, version: "3.2",
  },
  {
    id: "kb2", title: "Como redefinir as configurações de rede", catId: "rede",
    keywords: ["rede", "reset", "dns", "lentidão", "internet", "ip", "renovar"],
    summary: "Restaure o adaptador de rede para corrigir lentidão, IP duplicado e falhas de DNS.",
    body: [
      "Quando a conexão fica lenta ou páginas não carregam mesmo com o Wi-Fi conectado, o problema costuma estar no cache DNS ou na configuração de IP.",
    ],
    steps: [
      "Abra o Prompt de Comando como administrador",
      "Execute: ipconfig /release e depois ipconfig /renew",
      "Execute: ipconfig /flushdns",
      "Reinicie o computador e teste a navegação",
    ],
    author: "Bianca Rocha", updatedAt: ago(24 * 45), views: 864, version: "2.0",
  },
  {
    id: "kb3", title: "Redefinir minha senha do Active Directory", catId: "acessos",
    keywords: ["senha", "password", "esqueci", "bloqueio", "desbloqueio", "login"],
    summary: "Use o portal de autoatendimento para redefinir a senha sem abrir chamado.",
    body: [
      "O portal senha.vetra.com.br permite redefinir a senha corporativa com validação por código no celular cadastrado. Após a troca, atualize a senha no Outlook e no Wi-Fi do celular.",
    ],
    steps: [
      "Acesse senha.vetra.com.br em qualquer navegador",
      "Informe o usuário e clique em “Esqueci minha senha”",
      "Confirme o código enviado por SMS",
      "Crie a nova senha seguindo a política (12+ caracteres)",
    ],
    author: "Rafael Souza", updatedAt: ago(24 * 9), views: 2210, version: "4.1",
  },
  {
    id: "kb4", title: "Configurar o Outlook em um novo computador", catId: "m365",
    keywords: ["outlook", "email", "e-mail", "configurar", "novo computador", "conta"],
    summary: "Adicione sua conta corporativa ao Outlook com autenticação moderna.",
    body: [
      "Com a migração para o Microsoft 365, o Outlook configura a conta automaticamente. Basta entrar com o e-mail corporativo — as políticas de segurança são aplicadas sozinhas.",
    ],
    steps: [
      "Abra o Outlook e clique em “Adicionar conta”",
      "Digite seu e-mail corporativo completo",
      "Aprove a notificação no Microsoft Authenticator",
      "Aguarde a sincronização inicial das pastas",
    ],
    author: "Rafael Souza", updatedAt: ago(24 * 60), views: 512, version: "1.8",
  },
  {
    id: "kb5", title: "Mapear impressora de rede", catId: "impressao",
    keywords: ["impressora", "impressão", "instalar", "mapear", "driver"],
    summary: "Instale a impressora do seu andar em menos de dois minutos.",
    body: [
      "Todas as impressoras estão publicadas no diretório. Não é necessário baixar driver manualmente — o servidor de impressão distribui a versão correta.",
    ],
    steps: [
      "Pressione Win + R e digite \\\\printserver.vetra",
      "Localize a impressora pelo nome do andar (ex.: MATRIZ-7-HP)",
      "Clique com o botão direito e selecione “Conectar”",
      "Imprima uma página de teste",
    ],
    author: "Paula Freitas", updatedAt: ago(24 * 32), views: 977, version: "2.4",
  },
  {
    id: "kb6", title: "Como identificar um e-mail de phishing", catId: "seguranca",
    keywords: ["phishing", "email suspeito", "fraude", "golpe", "link", "segurança"],
    summary: "Aprenda a reconhecer tentativas de fraude e o que fazer ao receber uma.",
    body: [
      "Phishing é a principal porta de entrada de ataques. Desconfie de urgência excessiva, remetentes parecidos com os legítimos e links que não apontam para vetra.com.br.",
      "Na dúvida, não clique: encaminhe para seguranca@vetra.com.br e abra um chamado na categoria Segurança.",
    ],
    steps: [
      "Passe o mouse sobre o link sem clicar e confira o destino real",
      "Verifique o endereço completo do remetente",
      "Confira erros de português e saudações genéricas",
      "Reporte pelo botão “Relatar phishing” do Outlook",
    ],
    author: "Luiza Prado", updatedAt: ago(24 * 5), views: 1873, version: "5.0",
  },
  {
    id: "kb7", title: "Ativar a VPN para trabalho remoto", catId: "rede",
    keywords: ["vpn", "remoto", "home office", "acesso externo", "forticlient"],
    summary: "Instale e conecte o FortiClient para acessar os sistemas fora da empresa.",
    body: [
      "A VPN corporativa é obrigatória para acessar ERP, arquivos e áreas restritas fora da rede das unidades. O cliente oficial é o FortiClient.",
    ],
    steps: [
      "Baixe o FortiClient no portal software.vetra.com.br",
      "Crie a conexão: vpn.vetra.com.br (porta 443)",
      "Entre com usuário, senha e código do Authenticator",
      "Valide o cadeado verde na bandeja do sistema",
    ],
    author: "Bianca Rocha", updatedAt: ago(24 * 15), views: 1420, version: "3.6",
  },
  {
    id: "kb8", title: "Notebook lento: limpeza e diagnóstico rápido", catId: "hardware",
    keywords: ["notebook", "lento", "lentidão", "travando", "desempenho", "computador"],
    summary: "Cinco verificações rápidas antes de acionar o suporte presencial.",
    body: [
      "Na maioria dos casos de lentidão, a causa é acúmulo de processos em segundo plano ou espaço em disco esgotado. Faça o diagnóstico abaixo antes de abrir um chamado.",
    ],
    steps: [
      "Reinicie o notebook (não apenas suspenda)",
      "Verifique espaço livre: mínimo de 15% do disco",
      "Abra o Gerenciador de Tarefas e encerre processos acima de 30% de CPU",
      "Execute a limpeza de disco do Windows",
      "Se persistir, abra um chamado informando o patrimônio",
    ],
    author: "Rafael Souza", updatedAt: ago(24 * 75), views: 1655, version: "2.2",
  },
];

// ── SLA / templates / auditoria seed ─────────────────────────
export const SLA_RULES: SlaRule[] = [
  { id: "sla1", priority: "P1", scope: "Todas as categorias", frMin: 30, resMin: 240 },
  { id: "sla2", priority: "P2", scope: "Todas as categorias", frMin: 60, resMin: 480 },
  { id: "sla3", priority: "P3", scope: "Todas as categorias", frMin: 240, resMin: 1440 },
  { id: "sla4", priority: "P4", scope: "Todas as categorias", frMin: 480, resMin: 4320 },
  { id: "sla5", priority: "P1", scope: "Segurança da Informação", frMin: 15, resMin: 240 },
];

export const RESPONSE_TEMPLATES = [
  "Olá! Recebemos seu chamado e já estamos analisando. Retornaremos com um posicionamento em breve.",
  "Precisamos de mais informações para seguir com o atendimento. Poderia detalhar quando o problema começou e o que aparece em tela?",
  "Acesso concedido conforme solicitado. Por segurança, sua senha provisória foi enviada por SMS. Troque no primeiro acesso.",
  "Problema identificado e corrigido. Realizamos testes e está tudo funcionando. Qualquer reincidência, responda este chamado.",
  "Seu equipamento foi encaminhado à bancada técnica. Prazo estimado de diagnóstico: 24h úteis.",
];

export const AUDIT_SEED: AuditEntry[] = [
  { id: "au1", at: ago(2), user: "Carla Mendes", op: "Alterou regra de SLA", entity: "sla2 · P2", before: "Resolução: 12h", after: "Resolução: 8h", ip: "10.20.4.15" },
  { id: "au2", at: ago(6), user: "Carla Mendes", op: "Editou serviço", entity: "s-acesso-sistema", before: "Aprovação: não", after: "Aprovação: sim", ip: "10.20.4.15" },
  { id: "au3", at: ago(26), user: "Sistema", op: "Expiração de sessão em massa", entity: "política-sessao", before: "8h", after: "4h", ip: "—" },
  { id: "au4", at: ago(31), user: "Carla Mendes", op: "Inativou usuário", entity: "ricardo.teles", before: "Ativo", after: "Inativo (desligamento)", ip: "10.20.4.15" },
  { id: "au5", at: ago(50), user: "Diego Nunes", op: "Publicou artigo", entity: "kb1 · v3.2", before: "v3.1", after: "v3.2", ip: "10.20.9.31" },
  { id: "au6", at: ago(74), user: "Carla Mendes", op: "Alterou política de senha", entity: "senha-politica", before: "Mín. 10 caracteres", after: "Mín. 12 caracteres", ip: "10.20.4.15" },
];

export const NOTIF_SEED: Notif[] = [
  { id: "n1", at: ago(0.4), forRole: "all", forUser: "p1", text: "Rafael respondeu seu chamado CH-2481 (Wi-Fi)", kind: "comentario", read: false, ticketId: "tk1" },
  { id: "n2", at: ago(1.2), forRole: "all", forUser: "p1", text: "CH-2433 foi resolvido — avalie o atendimento", kind: "resolucao", read: false, ticketId: "tk6" },
  { id: "n3", at: ago(0.2), forRole: "tecnico", text: "SLA de resolução do CH-2481 vence em menos de 4h", kind: "sla", read: false, ticketId: "tk1" },
  { id: "n4", at: ago(2.5), forRole: "tecnico", text: "Novo chamado P1 · Internet indisponível — Campinas (CH-2412)", kind: "abertura", read: false, ticketId: "tk8" },
  { id: "n5", at: ago(3.1), forRole: "admin", text: "Aprovação pendente: Adobe Acrobat (CH-2455)", kind: "sistema", read: false, ticketId: "tk4" },
  { id: "n6", at: ago(5), forRole: "all", forUser: "p1", text: "Chamado CH-2481 atribuído a Rafael Souza", kind: "atribuicao", read: true, ticketId: "tk1" },
];

// ── Chamados de demonstração ─────────────────────────────────
let evId = 0;
const ev = (at: number, by: string, kind: TicketEvent["kind"], text: string): TicketEvent => ({
  id: `e${++evId}`, at, by, kind, text,
});
let msgId = 0;
const msg = (at: number, by: string, kind: TicketMessage["kind"], text: string): TicketMessage => ({
  id: `m${++msgId}`, at, by, kind, text,
});
let tkId = 0;
const nid = () => `tk${++tkId}`;

const richTickets: Ticket[] = [
  {
    id: nid(), code: "CH-2481", title: "Sem acesso ao Wi-Fi corporativo na Matriz",
    description: "Desde as 9h não consigo conectar ao Wi-Fi Vetra-Corp com meu notebook. A rede aparece, mas dá erro de autenticação após digitar a senha. Colegas do mesmo andar estão conectados normalmente.",
    serviceId: "s-wifi", catId: "rede", unitId: "u1", requesterId: "p1", techId: "p3", teamId: "t2",
    status: "atendimento", priority: "P3", impact: 2, urgency: 3,
    createdAt: ago(5), updatedAt: ago(0.4), frDue: ago(4), resDue: ahead(3.2), frAt: ago(4.4),
    assetId: "a1",
    attachments: [{ name: "erro-autenticacao.png", size: "184 KB", kind: "img" }],
    events: [
      ev(ago(5), "João Almeida", "create", "Chamado aberto pelo portal"),
      ev(ago(4.9), "Sistema", "assign", "Encaminhado à equipe Infraestrutura"),
      ev(ago(4.5), "Rafael Souza", "status", "Novo → Em atendimento"),
      ev(ago(1), "Rafael Souza", "comment", "Solicitou log do adaptador de rede"),
    ],
    messages: [
      msg(ago(5), "p1", "user", "Bom dia! Não consigo conectar no Wi-Fi desde cedo. Já reiniciei a máquina duas vezes."),
      msg(ago(4.4), "p3", "reply", "Bom dia, João! Vou analisar. Pode me confirmar se a rede Vetra-Corp aparece na lista e qual mensagem exata aparece ao tentar conectar?"),
      msg(ago(3.9), "p1", "user", "Aparece sim. Depois que digito a senha, mostra “Não foi possível conectar a esta rede”."),
      msg(ago(1), "p3", "internal", "Certificado da máquina expirou (Vetra-CA-2024). Renovar via SCCM e validar. Bianca já foi acionada para o perfil GPO."),
      msg(ago(0.4), "p3", "reply", "Identifiquei que o certificado do seu notebook venceu. Vou renovar remotamente — deixe o notebook ligado e conectado no cabo por 10 minutos, por favor."),
    ],
    rating: undefined, reopenCount: 0, relatedIds: [],
  },
  {
    id: nid(), code: "CH-2477", title: "ERP apresenta erro 500 ao salvar pedido de venda",
    description: "Ao salvar pedidos acima de 40 itens no ERP, o sistema retorna erro 500 e perde o lançamento. Ocorre desde a atualização de sexta-feira. Impacta o faturamento do CD.",
    serviceId: "s-erro-sistema", catId: "sistemas", unitId: "u3", requesterId: "p10", techId: "p5", teamId: "t3",
    status: "aguardando_terceiro", priority: "P2", impact: 3, urgency: 3,
    createdAt: ago(22), updatedAt: ago(2), frDue: ago(21), resDue: ahead(6), frAt: ago(21.3),
    attachments: [{ name: "print-erro500.png", size: "312 KB", kind: "img" }, { name: "pedido-exemplo.pdf", size: "88 KB", kind: "pdf" }],
    events: [
      ev(ago(22), "Otávio Ramos", "create", "Chamado aberto pelo portal"),
      ev(ago(21.4), "Diego Nunes", "status", "Novo → Em atendimento"),
      ev(ago(8), "Diego Nunes", "status", "Em atendimento → Aguardando terceiro (fornecedor ERP)"),
      ev(ago(2), "Diego Nunes", "link", "Vinculado a CH-2470 (mesma causa raiz)"),
    ],
    messages: [
      msg(ago(22), "p10", "user", "Erro 500 ao salvar pedido grande. Preciso faturar hoje ainda, é urgente."),
      msg(ago(21.3), "p5", "reply", "Otávio, reproduzimos o erro em ambiente de testes. Há um bug no módulo de pedidos após o patch 12.4. Acionamos o fornecedor com prioridade."),
      msg(ago(8), "p5", "reply", "Fornecedor confirmou o bug e liberou um hotfix em homologação. Assim que validarmos, aplicamos em produção."),
      msg(ago(7.8), "p5", "internal", "Hotfix 12.4.1 em homologação. Combinado com fornecedor janela de aplicação hoje 18h. Monitorar CH-2470 junto."),
    ],
    reopenCount: 0, relatedIds: ["tk10"],
  },
  {
    id: nid(), code: "CH-2468", title: "Notebook não liga após queda de energia",
    description: "Depois da queda de energia de ontem, o notebook não dá mais sinal de vida. LED de carga acende, mas não liga. Tenho apresentação amanhã e preciso da máquina.",
    serviceId: "s-notebook", catId: "hardware", unitId: "u2", requesterId: "p9", techId: "p8", teamId: "t1",
    status: "aguardando_usuario", priority: "P3", impact: 2, urgency: 2,
    createdAt: ago(28), updatedAt: ago(3), frDue: ago(26), resDue: ahead(1.5), frAt: ago(27),
    assetId: "a2",
    attachments: [{ name: "foto-led.jpg", size: "1,2 MB", kind: "img" }],
    events: [
      ev(ago(28), "Fernanda Dias", "create", "Chamado aberto pelo portal"),
      ev(ago(27), "Paula Freitas", "status", "Novo → Em atendimento"),
      ev(ago(3), "Paula Freitas", "status", "Em atendimento → Aguardando usuário"),
    ],
    messages: [
      msg(ago(28), "p9", "user", "Notebook morreu depois da queda de energia. Segue foto do LED."),
      msg(ago(27), "p8", "reply", "Fernanda, vou precisar que teste sem a bateria: remova, segure o power por 30s, conecte só o carregador e tente ligar. Me avisa o resultado!"),
      msg(ago(26.8), "p8", "internal", "Suspeita de proteção da fonte ativada. Se o teste não resolver, reservar máquina reserva PAT-0289 e recolher para bancada."),
    ],
    reopenCount: 0, relatedIds: [],
  },
  {
    id: nid(), code: "CH-2455", title: "Solicitação de software Adobe Acrobat Pro",
    description: "Preciso do Adobe Acrobat Pro para assinatura digital de contratos com clientes. Uso diário pela área de Operações.",
    serviceId: "s-acesso-sistema", catId: "acessos", unitId: "u1", requesterId: "p12", teamId: "t1",
    status: "aguardando_aprovacao", priority: "P4", impact: 1, urgency: 2,
    createdAt: ago(9), updatedAt: ago(9), frDue: ahead(40), resDue: ahead(60),
    attachments: [{ name: "justificativa-compras.docx", size: "42 KB", kind: "doc" }],
    events: [
      ev(ago(9), "Sérgio Vidal", "create", "Chamado aberto pelo portal"),
      ev(ago(9), "Sistema", "approval", "Enviado para aprovação do gestor (Serviço exige aprovação)"),
    ],
    messages: [msg(ago(9), "p12", "user", "Segue justificativa anexa. O Financeiro já validou o centro de custo.")],
    reopenCount: 0, relatedIds: [],
    approval: { required: true, state: "pendente" },
  },
  {
    id: nid(), code: "CH-2449", title: "Recebemos e-mail suspeito de suposto fornecedor",
    description: "Chegou um e-mail pedindo atualização de dados bancários em nome de um fornecedor real, com link para formulário. O domínio é parecido mas termina em .com.br-fatura.net.",
    serviceId: "s-phishing", catId: "seguranca", unitId: "u4", requesterId: "p11", techId: "p6", teamId: "t5",
    status: "triagem", priority: "P2", impact: 3, urgency: 3,
    createdAt: ago(2.2), updatedAt: ago(1.5), frDue: ahead(0.6), resDue: ahead(4),
    attachments: [{ name: "email-suspeito.eml", size: "96 KB", kind: "doc" }],
    events: [
      ev(ago(2.2), "Helena Costa", "create", "Chamado aberto pelo portal"),
      ev(ago(1.9), "Luiza Prado", "status", "Novo → Em triagem"),
    ],
    messages: [
      msg(ago(2.2), "p11", "user", "Não cliquei em nada, mas duas pessoas do RH receberam o mesmo e-mail."),
      msg(ago(1.5), "p6", "internal", "Cabeçalho aponta para infra conhecida de phishing (AS-4837). Bloquear domínio no gateway e varrer caixa dos demais destinatários."),
    ],
    reopenCount: 0, relatedIds: [],
  },
  {
    id: nid(), code: "CH-2433", title: "Instalar impressora do 7º andar no Financeiro",
    description: "Mudamos de mesa e a impressora MATRIZ-7-HP não aparece mais para as duas estações novas do Financeiro.",
    serviceId: "s-inst-imp", catId: "impressao", unitId: "u1", requesterId: "p1", techId: "p3", teamId: "t1",
    status: "resolvido", priority: "P4", impact: 1, urgency: 1,
    createdAt: ago(50), updatedAt: ago(20), frDue: ago(46), resDue: ago(26), frAt: ago(48), resolvedAt: ago(20),
    attachments: [],
    events: [
      ev(ago(50), "João Almeida", "create", "Chamado aberto pelo portal"),
      ev(ago(48), "Rafael Souza", "status", "Novo → Em atendimento"),
      ev(ago(20), "Rafael Souza", "status", "Em atendimento → Resolvido"),
    ],
    messages: [
      msg(ago(50), "p1", "user", "As duas máquinas novas não enxergam a impressora do andar."),
      msg(ago(20), "p3", "reply", "Impressora mapeada via printserver nas duas estações e página de teste impressa com sucesso. Qualquer coisa é só responder aqui!"),
    ],
    reopenCount: 0, relatedIds: [],
    solution: "Mapeamento via \\\\printserver.vetra com driver distribuído pelo servidor de impressão.",
  },
  {
    id: nid(), code: "CH-2420", title: "VPN caindo a cada 10 minutos em home office",
    description: "Trabalho remoto e a VPN FortiClient desconecta sozinha a cada 10 minutos, derrubando também a sessão do ERP.",
    serviceId: "s-vpn", catId: "rede", unitId: "u1", requesterId: "p1", techId: "p4", teamId: "t2",
    status: "encerrado", priority: "P3", impact: 2, urgency: 2,
    createdAt: ago(120), updatedAt: ago(96), frDue: ago(118), resDue: ago(100), frAt: ago(119), resolvedAt: ago(98), closedAt: ago(96),
    attachments: [],
    events: [
      ev(ago(120), "João Almeida", "create", "Chamado aberto pelo portal"),
      ev(ago(119), "Bianca Rocha", "status", "Novo → Em atendimento"),
      ev(ago(98), "Bianca Rocha", "status", "Em atendimento → Resolvido"),
      ev(ago(96), "João Almeida", "status", "Resolvido → Encerrado"),
      ev(ago(96), "João Almeida", "rate", "Avaliação: 4/5 — atendimento bom"),
    ],
    messages: [
      msg(ago(119), "p4", "reply", "João, seu perfil de VPN estava com keep-alive desativado após a atualização do FortiClient. Reapliquei o perfil padrão."),
      msg(ago(98), "p4", "reply", "Ajuste aplicado e validado com 2h de conexão estável. Encerrando como resolvido — se voltar a cair, é só reabrir."),
    ],
    rating: { stars: 4, resolved: true, comment: "Resolveu rápido, só demorou um pouco para o primeiro contato." },
    reopenCount: 0, relatedIds: [],
    solution: "Reaplicação do perfil FortiClient com keep-alive habilitado via GPO.",
  },
  {
    id: nid(), code: "CH-2412", title: "INCIDENTE · Internet indisponível na Filial Campinas",
    description: "Link principal e redundante da filial Campinas fora desde 07h40. Todas as operações da unidade impactadas: PDV, telefonia IP e acesso ao ERP.",
    serviceId: "s-internet", catId: "rede", unitId: "u2", requesterId: "p9", techId: "p4", teamId: "t2",
    status: "atendimento", priority: "P1", impact: 4, urgency: 4,
    createdAt: ago(7), updatedAt: ago(0.5), frDue: ago(6.5), resDue: ahead(1.2), frAt: ago(6.8),
    attachments: [{ name: "monitoramento-links.png", size: "220 KB", kind: "img" }],
    events: [
      ev(ago(7), "Fernanda Dias", "create", "Chamado aberto pelo portal"),
      ev(ago(6.8), "Bianca Rocha", "status", "Novo → Em atendimento"),
      ev(ago(6.5), "Bianca Rocha", "priority", "Prioridade recalculada: P1 · Crítica"),
      ev(ago(5), "Bianca Rocha", "link", "Incidente em massa — vinculados CH-2413, CH-2414 e CH-2415"),
      ev(ago(2), "Bianca Rocha", "comment", "Operadora confirmou rompimento de fibra na região. Previsão de reparo 16h."),
    ],
    messages: [
      msg(ago(6.8), "p4", "reply", "Time Campinas, identificamos queda nos dois links. Acionamos as operadoras com prioridade máxima e subimos o link 4G de contingência para o PDV."),
      msg(ago(2), "p4", "reply", "Atualização: operadora confirmou rompimento de fibra. Previsão de normalização às 16h. Contingência 4G operando para sistemas críticos."),
      msg(ago(1.8), "p4", "internal", "Cobrar operadora o relatório de causa raiz (RCA). Agendar reunião de pós-incidente com Infra + gestor da unidade."),
    ],
    reopenCount: 0, relatedIds: ["tk11", "tk12", "tk13"],
  },
];

// filho do incidente + histórico fechado para dashboards/CSAT
const closedSeed: Array<[string, string, string, string, number, number, number, string?, string?]> = [
  // title, serviceId, catId, requesterId, daysAgo, resHours, stars, unitId, techId
  ["PDV sem conexão com o servidor", "s-cabo", "rede", "p9", 6.2, 3.1, 5, "u2", "p8"],
  ["Não consigo acessar o Wi-Fi", "s-wifi", "rede", "p9", 6.1, 2.4, 4, "u2", "p4"],
  ["Wi-Fi da copa muito lento", "s-wifi", "rede", "p9", 6.0, 4.0, 4, "u2", "p8"],
  ["Monitor com listras verticais", "s-monitor", "hardware", "p10", 4, 20, 5, "u3", "p3"],
  ["Erro ao emitir nota fiscal", "s-erro-sistema", "sistemas", "p10", 3.2, 5, 3, "u3", "p5"],
  ["Divergência no relatório de estoque", "s-relatorio", "sistemas", "p10", 2.9, 7, 4, "u3", "p5"],
  ["Outlook não sincroniza no celular", "s-outlook", "m365", "p1", 9, 1.5, 5, "u1", "p3"],
  ["Solicito acesso ao CRM", "s-acesso-sistema", "acessos", "p1", 12, 6, 4, "u1", "p5"],
  ["Teclado com teclas falhando", "s-perifericos", "hardware", "p1", 15, 26, 5, "u1", "p8"],
  ["OneDrive sem sincronizar pasta", "s-onedrive", "m365", "p12", 18, 9, 4, "u1", "p4"],
  ["Toner da impressora do RH", "s-toner", "impressao", "p11", 20, 30, 5, "u4", "p8"],
  ["Ramal sem tom de discagem", "s-ramal", "telefonia", "p11", 22, 12, 3, "u4", "p4"],
  ["Celular corporativo sem sinal", "s-celular", "telefonia", "p12", 25, 18, 4, "u1", "p3"],
  ["Lentidão geral no ERP", "s-lentidao", "sistemas", "p10", 27, 10, 4, "u3", "p5"],
  ["Pop-up suspeito no navegador", "s-virus", "seguranca", "p9", 30, 3, 5, "u2", "p6"],
  ["Criação de usuário — novo analista", "s-criar-usuario", "acessos", "p11", 33, 4, 5, "u4", "p3"],
];

const generated: Ticket[] = closedSeed.map((s, i) => {
  const [title, serviceId, catId, requesterId, daysAgo, resHours, stars, unitId, techId] = s;
  const created = ago(daysAgo * 24);
  const resolved = created + resHours * H;
  const sv = serviceById(serviceId);
  const req = userById(requesterId);
  const tech = userById(techId);
  return {
    id: nid(),
    code: `CH-${2400 - i}`,
    title: title as string,
    description: "Relato registrado pelo portal — detalhes no histórico de atendimento.",
    serviceId: serviceId as string,
    catId: catId as string,
    unitId: (unitId as string) ?? "u1",
    requesterId: requesterId as string,
    techId: techId as string,
    teamId: sv?.service.teamId,
    status: i % 5 === 2 ? "encerrado" : "encerrado",
    priority: matrixPriority(2, i % 2 === 0 ? 2 : 1),
    impact: 2,
    urgency: (i % 2 === 0 ? 2 : 1) as Level,
    createdAt: created,
    updatedAt: resolved,
    frDue: created + (sv?.service.frH ?? 4) * H,
    resDue: created + (sv?.service.resH ?? 24) * H,
    frAt: created + 0.6 * H,
    resolvedAt: resolved,
    closedAt: resolved + 5 * H,
    attachments: [],
    events: [
      ev(created, req?.name ?? "Usuário", "create", "Chamado aberto pelo portal"),
      ev(created + 0.6 * H, tech?.name ?? "Técnico", "status", "Novo → Em atendimento"),
      ev(resolved, tech?.name ?? "Técnico", "status", "Em atendimento → Resolvido"),
      ev(resolved + 5 * H, req?.name ?? "Usuário", "rate", `Avaliação: ${stars}/5`),
    ],
    messages: [
      msg(created, requesterId as string, "user", title as string),
      msg(resolved, techId as string, "reply", "Atendimento concluído com validação do usuário. Chamado resolvido."),
    ],
    rating: { stars: stars as number, resolved: true },
    reopenCount: 0,
    relatedIds: [],
    solution: "Solução registrada e validada com o solicitante.",
  };
});

// relacionado do CH-2470 (mesma causa raiz do ERP)
const relatedErp: Ticket = {
  id: nid(), code: "CH-2470", title: "Faturamento trava ao emitir NF-e em lote",
  description: "Emissão de notas em lote falha com timeout no módulo fiscal, mesmo problema do CH-2477.",
  serviceId: "s-erro-sistema", catId: "sistemas", unitId: "u3", requesterId: "p10", techId: "p5", teamId: "t3",
  status: "aguardando_terceiro", priority: "P2", impact: 3, urgency: 3,
  createdAt: ago(30), updatedAt: ago(3), frDue: ago(29), resDue: ahead(9), frAt: ago(29.2),
  attachments: [],
  events: [
    ev(ago(30), "Otávio Ramos", "create", "Chamado aberto pelo portal"),
    ev(ago(29), "Diego Nunes", "status", "Novo → Em atendimento"),
    ev(ago(2.5), "Diego Nunes", "link", "Vinculado a CH-2477 (mesma causa raiz)"),
  ],
  messages: [msg(ago(29.2), "p5", "reply", "Mesma causa raiz do CH-2477 — o hotfix do fornecedor cobre os dois cenários.")],
  reopenCount: 0, relatedIds: ["tk2"],
};

export const SEED_TICKETS: Ticket[] = [relatedErp, ...richTickets, ...generated];

// ── séries para dashboards ───────────────────────────────────
export const MONTHLY_SERIES = [
  { label: "Mar", open: 168, closed: 154 },
  { label: "Abr", open: 187, closed: 181 },
  { label: "Mai", open: 204, closed: 199 },
  { label: "Jun", open: 176, closed: 183 },
  { label: "Jul", open: 221, closed: 214 },
  { label: "Ago", open: 247, closed: 236 },
];
export const CSAT_DIST = [
  { label: "5★", value: 96 },
  { label: "4★", value: 41 },
  { label: "3★", value: 12 },
  { label: "2★", value: 4 },
  { label: "1★", value: 2 },
];
export const TECH_PRODUCTIVITY = [
  { label: "Seg", value: 6 },
  { label: "Ter", value: 9 },
  { label: "Qua", value: 7 },
  { label: "Qui", value: 11 },
  { label: "Sex", value: 8 },
  { label: "Sáb", value: 2 },
  { label: "Dom", value: 1 },
];
