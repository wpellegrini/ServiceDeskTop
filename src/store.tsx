import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type {
  Article, AuditEntry, Level, Notif, Priority, SlaRule, Ticket, TicketEvent,
  TicketMessage, TicketStatus, User,
} from "./data/data";
import {
  IMPACTS, PRIORITY_META, SEED_TICKETS, NOTIF_SEED, ARTICLES, USERS, AUDIT_SEED,
  SLA_RULES, STATUS_META, URGENCIES, matrixPriority, serviceById, userById,
} from "./data/data";

export type Page =
  | "login" | "home" | "catalogo" | "novo" | "chamados" | "chamado" | "kb"
  | "tech-dash" | "fila"
  | "admin-dash" | "admin-usuarios" | "admin-tecnicos" | "admin-unidades"
  | "admin-catalogo" | "admin-sla" | "admin-ativos" | "admin-kb"
  | "admin-relatorios" | "admin-auditoria" | "admin-config";

export interface Route { page: Page; params?: Record<string, string> }
export interface Toast { id: number; text: string; kind: "ok" | "info" | "warn" | "danger" }

interface AppCtx {
  user: User | null;
  users: User[];
  login: (id: string) => void;
  logout: () => void;
  route: Route;
  nav: (page: Page, params?: Record<string, string>) => void;
  tickets: Ticket[];
  ticketById: (id?: string) => Ticket | undefined;
  createTicket: (t: Partial<Ticket>) => Ticket;
  patchTicket: (id: string, patch: Partial<Ticket>, event?: TicketEvent) => void;
  addEvent: (id: string, kind: TicketEvent["kind"], text: string) => void;
  addMessage: (id: string, kind: TicketMessage["kind"], text: string) => void;
  changeStatus: (id: string, status: TicketStatus) => void;
  assignTicket: (id: string, techId: string) => void;
  setPriority: (id: string, impact: Level, urgency: Level) => void;
  rateTicket: (id: string, stars: number, resolved: boolean, comment?: string) => void;
  reopenTicket: (id: string) => void;
  resolveTicket: (id: string, solution: string) => void;
  linkRelated: (id: string, otherId: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  notifs: Notif[];
  pushNotif: (n: Partial<Notif>) => void;
  markNotifsRead: () => void;
  articles: Article[];
  addArticle: (a: Article) => void;
  slaRules: SlaRule[];
  updateSlaRule: (id: string, patch: Partial<SlaRule>) => void;
  audit: AuditEntry[];
  logAudit: (op: string, entity: string, before: string, after: string) => void;
  toggleUser: (id: string) => void;
  toasts: Toast[];
  toast: (text: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
  prefill: { serviceId?: string; assetId?: string };
  setPrefill: (p: { serviceId?: string; assetId?: string }) => void;
}

const Ctx = createContext<AppCtx | null>(null);

let uid = 1000;
const genId = () => `g${++uid}-${Date.now() % 100000}`;

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("nimbus_session");
      return saved ? USERS.find((u) => u.id === saved) ?? null : null;
    } catch {
      return null;
    }
  });
  const [users, setUsers] = useState<User[]>(USERS);
  const [route, setRoute] = useState<Route>({ page: "login" });
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [favorites, setFavorites] = useState<string[]>(["tk8"]);
  const [notifs, setNotifs] = useState<Notif[]>(NOTIF_SEED);
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [slaRules, setSlaRules] = useState<SlaRule[]>(SLA_RULES);
  const [audit, setAudit] = useState<AuditEntry[]>(AUDIT_SEED);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [prefill, setPrefill] = useState<{ serviceId?: string; assetId?: string }>({});
  const toastId = useRef(0);

  useEffect(() => {
    if (user) {
      const home: Page = user.role === "admin" ? "admin-dash" : user.role === "tecnico" ? "tech-dash" : "home";
      setRoute({ page: home });
    } else {
      setRoute({ page: "login" });
    }
  }, [user]);

  const nav = useCallback((page: Page, params?: Record<string, string>) => {
    setRoute({ page, params });
    window.scrollTo({ top: 0 });
  }, []);

  const toast = useCallback((text: string, kind: Toast["kind"] = "ok") => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-3), { id, text, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const pushNotif = useCallback((n: Partial<Notif>) => {
    setNotifs((list) => [
      {
        id: genId(), at: Date.now(), forRole: "all", text: "", kind: "sistema", read: false,
        ...n,
      } as Notif,
      ...list,
    ]);
  }, []);

  const addEvent = useCallback((id: string, kind: TicketEvent["kind"], text: string) => {
    if (!user) return;
    setTickets((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, updatedAt: Date.now(), events: [...t.events, { id: genId(), at: Date.now(), by: user.name, kind, text }] }
          : t,
      ),
    );
  }, [user]);

  const patchTicket = useCallback((id: string, patch: Partial<Ticket>, event?: TicketEvent) => {
    setTickets((ts) =>
      ts.map((t) =>
        t.id === id
          ? { ...t, ...patch, updatedAt: Date.now(), events: event ? [...t.events, event] : t.events }
          : t,
      ),
    );
  }, []);

  const addMessage = useCallback((id: string, kind: TicketMessage["kind"], text: string) => {
    if (!user) return;
    const m: TicketMessage = { id: genId(), at: Date.now(), by: user.id, kind, text };
    setTickets((ts) =>
      ts.map((t) => (t.id === id ? { ...t, updatedAt: Date.now(), messages: [...t.messages, m] } : t)),
    );
    const t = tickets.find((x) => x.id === id);
    if (kind !== "internal" && t) {
      pushNotif({
        forRole: kind === "user" ? "tecnico" : "all",
        forUser: kind === "reply" ? t.requesterId : undefined,
        text: `${user.name} comentou em ${t.code}`,
        kind: "comentario",
        ticketId: id,
      });
    }
  }, [user, tickets, pushNotif]);

  const createTicket = useCallback((t: Partial<Ticket>) => {
    if (!user) throw new Error("no session");
    const maxNum = tickets.reduce((m, x) => Math.max(m, parseInt(x.code.replace("CH-", ""), 10) || 0), 2400);
    const now = Date.now();
    const sv = serviceById(t.serviceId);
    const impact = (t.impact ?? 2) as Level;
    const urgency = (t.urgency ?? 2) as Level;
    const ticket: Ticket = {
      id: genId(),
      code: `CH-${maxNum + 1}`,
      title: t.title ?? "Novo chamado",
      description: t.description ?? "",
      serviceId: t.serviceId ?? "s-pc",
      catId: t.catId ?? "hardware",
      unitId: t.unitId ?? user.unitId,
      requesterId: user.id,
      teamId: sv?.service.teamId,
      status: sv?.service.approval ? "aguardando_aprovacao" : "novo",
      priority: matrixPriority(impact, urgency),
      impact, urgency,
      createdAt: now, updatedAt: now,
      frDue: now + (sv?.service.frH ?? 4) * 3600_000,
      resDue: now + (sv?.service.resH ?? 24) * 3600_000,
      assetId: t.assetId,
      attachments: t.attachments ?? [],
      events: [
        { id: genId(), at: now, by: user.name, kind: "create", text: "Chamado aberto pelo portal" },
        ...(sv?.service.approval
          ? [{ id: genId(), at: now, by: "Sistema", kind: "approval" as const, text: "Enviado para aprovação do gestor (serviço exige aprovação)" }]
          : []),
      ],
      messages: [{ id: genId(), at: now, by: user.id, kind: "user", text: t.description ?? "" }],
      reopenCount: 0,
      relatedIds: [],
      approval: sv?.service.approval ? { required: true, state: "pendente" } : undefined,
    };
    setTickets((ts) => [ticket, ...ts]);
    pushNotif({ forRole: "tecnico", text: `Novo chamado ${ticket.code} · ${ticket.title}`, kind: "abertura", ticketId: ticket.id });
    if (sv?.service.approval) pushNotif({ forRole: "admin", text: `Aprovação pendente: ${ticket.title} (${ticket.code})`, kind: "sistema", ticketId: ticket.id });
    return ticket;
  }, [user, tickets, pushNotif]);

  const changeStatus = useCallback((id: string, status: TicketStatus) => {
    const t = tickets.find((x) => x.id === id);
    if (!t) return;
    const extra: Partial<Ticket> = {};
    if (status === "resolvido") extra.resolvedAt = Date.now();
    if (status === "encerrado") extra.closedAt = Date.now();
    patchTicket(id, { status, ...extra }, {
      id: genId(), at: Date.now(), by: user?.name ?? "Sistema", kind: "status",
      text: `${STATUS_META[t.status].label} → ${STATUS_META[status].label}`,
    });
    if (status === "resolvido" || status === "encerrado") {
      pushNotif({ forRole: "all", forUser: t.requesterId, text: `${t.code} foi ${STATUS_META[status].label.toLowerCase()}`, kind: "resolucao", ticketId: id });
    }
    if (status === "aguardando_usuario") {
      pushNotif({ forRole: "all", forUser: t.requesterId, text: `O técnico solicitou informações em ${t.code}`, kind: "info", ticketId: id });
    }
  }, [tickets, patchTicket, user, pushNotif]);

  const assignTicket = useCallback((id: string, techId: string) => {
    const tech = userById(techId);
    patchTicket(id, { techId, status: "atendimento" }, {
      id: genId(), at: Date.now(), by: user?.name ?? "Sistema", kind: "assign",
      text: `Atribuído a ${tech?.name ?? "técnico"}`,
    });
    const t = tickets.find((x) => x.id === id);
    pushNotif({ forRole: "tecnico", forUser: techId, text: `Chamado ${t?.code} atribuído a você`, kind: "atribuicao", ticketId: id });
    pushNotif({ forRole: "all", forUser: t?.requesterId, text: `${t?.code} agora está com ${tech?.name}`, kind: "atribuicao", ticketId: id });
  }, [patchTicket, user, tickets, pushNotif]);

  const setPriority = useCallback((id: string, impact: Level, urgency: Level) => {
    const p = matrixPriority(impact, urgency);
    patchTicket(id, { impact, urgency, priority: p }, {
      id: genId(), at: Date.now(), by: user?.name ?? "Sistema", kind: "priority",
      text: `Prioridade recalculada: ${PRIORITY_META[p].label} (impacto ${IMPACTS[impact]} × urgência ${URGENCIES[urgency]})`,
    });
  }, [patchTicket, user]);

  const rateTicket = useCallback((id: string, stars: number, resolved: boolean, comment?: string) => {
    patchTicket(id, { rating: { stars, resolved, comment }, status: "encerrado", closedAt: Date.now() }, {
      id: genId(), at: Date.now(), by: user?.name ?? "Usuário", kind: "rate",
      text: `Avaliação: ${stars}/5 · problema ${resolved ? "resolvido" : "não resolvido"}${comment ? ` — “${comment}”` : ""}`,
    });
  }, [patchTicket, user]);

  const reopenTicket = useCallback((id: string) => {
    const t = tickets.find((x) => x.id === id);
    if (!t) return;
    patchTicket(id, { status: "atendimento", reopenCount: t.reopenCount + 1, resolvedAt: undefined, closedAt: undefined }, {
      id: genId(), at: Date.now(), by: user?.name ?? "Usuário", kind: "reopen",
      text: `Chamado reaberto (reabertura nº ${t.reopenCount + 1})`,
    });
    pushNotif({ forRole: "tecnico", text: `${t.code} foi reaberto pelo solicitante`, kind: "abertura", ticketId: id });
  }, [tickets, patchTicket, user, pushNotif]);

  const resolveTicket = useCallback((id: string, solution: string) => {
    patchTicket(id, { status: "resolvido", resolvedAt: Date.now(), solution }, {
      id: genId(), at: Date.now(), by: user?.name ?? "Técnico", kind: "status",
      text: "Em atendimento → Resolvido",
    });
    const t = tickets.find((x) => x.id === id);
    pushNotif({ forRole: "all", forUser: t?.requesterId, text: `${t?.code} foi resolvido — avalie o atendimento`, kind: "resolucao", ticketId: id });
  }, [patchTicket, user, tickets, pushNotif]);

  const linkRelated = useCallback((id: string, otherId: string) => {
    const a = tickets.find((x) => x.id === id);
    const b = tickets.find((x) => x.id === otherId);
    if (!a || !b || id === otherId || a.relatedIds.includes(otherId)) return;
    patchTicket(id, { relatedIds: [...a.relatedIds, otherId] }, {
      id: genId(), at: Date.now(), by: user?.name ?? "Técnico", kind: "link",
      text: `Vinculado a ${b.code}`,
    });
    patchTicket(otherId, { relatedIds: [...b.relatedIds, id] }, {
      id: genId(), at: Date.now(), by: user?.name ?? "Técnico", kind: "link",
      text: `Vinculado a ${a.code}`,
    });
  }, [tickets, patchTicket, user]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  }, []);

  const addArticle = useCallback((a: Article) => {
    setArticles((list) => [a, ...list]);
    logAuditInternal("Publicou artigo", `${a.title} · v${a.version}`, "—", `v${a.version}`);
  }, []);

  const updateSlaRule = useCallback((id: string, patch: Partial<SlaRule>) => {
    setSlaRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const logAuditInternal = (op: string, entity: string, before: string, after: string) => {
    setAudit((list) => [
      { id: genId(), at: Date.now(), user: user?.name ?? "Sistema", op, entity, before, after, ip: "10.20.4.15" },
      ...list,
    ]);
  };

  const logAudit = useCallback((op: string, entity: string, before: string, after: string) => {
    logAuditInternal(op, entity, before, after);
  }, [user]);

  const toggleUser = useCallback((id: string) => {
    setUsers((us) => us.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
    const u = users.find((x) => x.id === id);
    if (u) logAuditInternal(u.active ? "Inativou usuário" : "Reativou usuário", u.name, u.active ? "Ativo" : "Inativo", u.active ? "Inativo" : "Ativo");
  }, [users]);

  const markNotifsRead = useCallback(() => {
    setNotifs((ns) => ns.map((n) => (visibleNotif(n) ? { ...n, read: true } : n)));
  }, [user]);

  function visibleNotif(n: Notif) {
    if (!user) return false;
    if (n.forUser) return n.forUser === user.id;
    return n.forRole === "all" || n.forRole === user.role;
  }

  const visibleNotifs = useMemo(() => notifs.filter(visibleNotif), [notifs, user]);

  const login = useCallback((id: string) => {
    const u = USERS.find((x) => x.id === id);
    if (!u) return;
    setUser(u);
    try { localStorage.setItem("nimbus_session", id); } catch { /* noop */ }
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem("nimbus_session"); } catch { /* noop */ }
  }, []);

  const ticketById = useCallback((id?: string) => tickets.find((t) => t.id === id), [tickets]);

  const value: AppCtx = {
    user, users, login, logout, route, nav,
    tickets, ticketById, createTicket, patchTicket, addEvent, addMessage,
    changeStatus, assignTicket, setPriority, rateTicket, reopenTicket, resolveTicket,
    linkRelated, favorites, toggleFavorite,
    notifs: visibleNotifs, pushNotif, markNotifsRead,
    articles, addArticle, slaRules, updateSlaRule, audit, logAudit, toggleUser,
    toasts, toast, dismissToast, prefill, setPrefill,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp fora do AppProvider");
  return ctx;
}
