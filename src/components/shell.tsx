import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Bell, BookOpen, Building2, ChevronDown, ClipboardList, Gauge, History, Inbox,
  LayoutDashboard, LifeBuoy, LogOut, Menu, MonitorSmartphone, Plus, Search,
  Settings, ShieldCheck, SlidersHorizontal, Users2, Workflow, X, CheckCircle2,
  AlertTriangle, Info, XCircle, MessageSquare, PackageCheck, UserCog,
} from "lucide-react";
import { useApp } from "../store";
import type { Page } from "../store";
import { Avatar, Logo } from "./ui";
import { timeAgo } from "../data/data";

interface NavItem { page: Page; label: string; icon: ReactNode }
interface NavGroup { title?: string; items: NavItem[] }

function navFor(role: string): NavGroup[] {
  if (role === "usuario")
    return [{
      items: [
        { page: "home", label: "Início", icon: <LifeBuoy className="size-4.5" /> },
        { page: "catalogo", label: "Catálogo de Serviços", icon: <PackageCheck className="size-4.5" /> },
        { page: "chamados", label: "Meus Chamados", icon: <Inbox className="size-4.5" /> },
        { page: "kb", label: "Base de Conhecimento", icon: <BookOpen className="size-4.5" /> },
      ],
    }];
  if (role === "tecnico")
    return [{
      items: [
        { page: "tech-dash", label: "Meu Painel", icon: <Gauge className="size-4.5" /> },
        { page: "fila", label: "Fila de Atendimento", icon: <ClipboardList className="size-4.5" /> },
        { page: "kb", label: "Base de Conhecimento", icon: <BookOpen className="size-4.5" /> },
      ],
    }];
  return [
    {
      title: "Visão geral",
      items: [
        { page: "admin-dash", label: "Dashboard Executivo", icon: <LayoutDashboard className="size-4.5" /> },
        { page: "fila", label: "Fila de Atendimento", icon: <ClipboardList className="size-4.5" /> },
      ],
    },
    {
      title: "Gestão",
      items: [
        { page: "admin-usuarios", label: "Usuários", icon: <Users2 className="size-4.5" /> },
        { page: "admin-tecnicos", label: "Técnicos & Equipes", icon: <UserCog className="size-4.5" /> },
        { page: "admin-unidades", label: "Unidades", icon: <Building2 className="size-4.5" /> },
        { page: "admin-catalogo", label: "Catálogo & Serviços", icon: <Workflow className="size-4.5" /> },
        { page: "admin-sla", label: "Regras de SLA", icon: <SlidersHorizontal className="size-4.5" /> },
      ],
    },
    {
      title: "Operação",
      items: [
        { page: "admin-ativos", label: "Ativos de TI", icon: <MonitorSmartphone className="size-4.5" /> },
        { page: "admin-kb", label: "Base de Conhecimento", icon: <BookOpen className="size-4.5" /> },
        { page: "admin-relatorios", label: "Relatórios", icon: <History className="size-4.5" /> },
        { page: "admin-auditoria", label: "Auditoria", icon: <ShieldCheck className="size-4.5" /> },
        { page: "admin-config", label: "Configurações", icon: <Settings className="size-4.5" /> },
      ],
    },
  ];
}

const ROLE_LABEL: Record<string, string> = { usuario: "Portal do Usuário", tecnico: "Técnico de Suporte", admin: "Administração" };

export function Shell({ children }: { children: ReactNode }) {
  const { user, route, nav, logout, notifs, markNotifsRead, tickets, users, articles, toast } = useApp();
  const [drawer, setDrawer] = useState(false);
  const [bell, setBell] = useState(false);
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDrawer(false); setBell(false); setMenu(false); }, [route]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocus(false);
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBell(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return null;
    const tks = tickets.filter((t) =>
      [t.code, t.title, t.description].some((s) => s.toLowerCase().includes(term)),
    ).slice(0, 5);
    const ppl = users.filter((u) => u.name.toLowerCase().includes(term)).slice(0, 4);
    const arts = articles.filter((a) =>
      a.title.toLowerCase().includes(term) || a.keywords.some((k) => k.includes(term)),
    ).slice(0, 4);
    return { tks, ppl, arts };
  }, [q, tickets, users, articles]);

  if (!user) return null;
  const groups = navFor(user.role);
  const unread = notifs.filter((n) => !n.read).length;

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="grid-faint border-b border-white/10 px-5 py-5">
        <Logo dark />
      </div>
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
        <Avatar name={user.name} color={user.color} size={38} online={user.online} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-paper">{user.name}</p>
          <p className="truncate text-[10px] font-medium tracking-wider text-brand-200 uppercase">{ROLE_LABEL[user.role]}</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.title ?? "main"} className="mb-5">
            {g.title && (
              <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.16em] text-pine-100/40 uppercase">{g.title}</p>
            )}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = route.page === it.page;
                return (
                  <li key={it.page}>
                    <button
                      onClick={() => nav(it.page)}
                      className={`group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-[13px] font-medium transition-all duration-200 ${
                        active ? "bg-brand-500/15 text-brand-200" : "text-pine-100/70 hover:bg-white/5 hover:text-paper"
                      }`}
                    >
                      <span className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-400 transition-all ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
                      {it.icon}
                      {it.label}
                      {it.page === "fila" && user.role !== "usuario" && (
                        <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-pine-100/80">
                          {tickets.filter((t) => !["encerrado", "cancelado", "resolvido"].includes(t.status)).length}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-lg bg-brand-500/10 p-3 ring-1 ring-brand-500/20">
          <p className="text-[11px] leading-snug text-brand-200">
            <span className="font-semibold text-paper">SSO Microsoft Entra ID</span> chega na próxima release — autenticação única para toda a Vetra.
          </p>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-pine-100/70 transition hover:bg-white/5 hover:text-paper">
          <LogOut className="size-4" /> Sair da sessão
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-[248px]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] bg-pine-900 lg:block">{SidebarContent}</aside>

      {/* Drawer mobile */}
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="anim-fade-in absolute inset-0 bg-pine-950/60" onClick={() => setDrawer(false)} />
          <aside className="anim-slide-l absolute inset-y-0 left-0 w-[270px] bg-pine-900 shadow-pop">
            <button onClick={() => setDrawer(false)} className="absolute right-3 top-5 z-10 grid size-8 place-items-center rounded-lg text-pine-100/70 hover:bg-white/10" aria-label="Fechar menu">
              <X className="size-5" />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Topbar */}
      <header className="sticky top-0 z-20 border-b border-line bg-card/90 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
          <button onClick={() => setDrawer(true)} className="grid size-9 place-items-center rounded-lg border border-line text-ink-soft lg:hidden" aria-label="Abrir menu">
            <Menu className="size-5" />
          </button>
          <div className="hidden sm:block lg:hidden"><Logo /></div>

          {/* Pesquisa global */}
          <div ref={searchRef} className="relative ml-auto w-full max-w-xs sm:max-w-sm lg:ml-0 lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              placeholder="Buscar chamado, pessoa, artigo… (ex.: CH-2481)"
              className="w-full rounded-lg border border-line bg-paper py-2 pl-9 pr-3 text-[13px] outline-none transition focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
            {searchFocus && results && (
              <div className="anim-fade-up absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-card p-2 shadow-pop">
                {results.tks.length === 0 && results.ppl.length === 0 && results.arts.length === 0 && (
                  <p className="px-3 py-6 text-center text-xs text-ink-faint">Nada encontrado para “{q}”.</p>
                )}
                {results.tks.length > 0 && <p className="px-2 pb-1 pt-1 text-[10px] font-bold tracking-widest text-ink-faint uppercase">Chamados</p>}
                {results.tks.map((t) => (
                  <button key={t.id} onClick={() => { nav("chamado", { id: t.id }); setQ(""); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-paper">
                    <span className="font-mono text-[11px] font-semibold text-brand-700">{t.code}</span>
                    <span className="truncate text-[13px] text-ink">{t.title}</span>
                  </button>
                ))}
                {results.ppl.length > 0 && <p className="px-2 pb-1 pt-2 text-[10px] font-bold tracking-widest text-ink-faint uppercase">Pessoas</p>}
                {results.ppl.map((p) => (
                  <div key={p.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
                    <Avatar name={p.name} color={p.color} size={26} />
                    <span className="text-[13px] text-ink">{p.name}</span>
                    <span className="ml-auto text-[11px] text-ink-faint">{p.dept} · {ROLE_LABEL[p.role]}</span>
                  </div>
                ))}
                {results.arts.length > 0 && <p className="px-2 pb-1 pt-2 text-[10px] font-bold tracking-widest text-ink-faint uppercase">Base de Conhecimento</p>}
                {results.arts.map((a) => (
                  <button key={a.id} onClick={() => { nav(user.role === "usuario" ? "kb" : "admin-kb"); setQ(""); }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-paper">
                    <BookOpen className="size-4 text-brand-600" />
                    <span className="truncate text-[13px] text-ink">{a.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notificações */}
          <div ref={bellRef} className="relative">
            <button onClick={() => setBell((b) => !b)} className="relative grid size-9 place-items-center rounded-lg border border-line text-ink-soft transition hover:text-brand-700" aria-label="Notificações">
              <Bell className="size-4.5" />
              {unread > 0 && (
                <span className="anim-pop absolute -right-1 -top-1 grid size-4.5 place-items-center rounded-full bg-danger-500 text-[9px] font-bold text-white">
                  {unread}
                </span>
              )}
            </button>
            {bell && (
              <div className="anim-fade-up absolute right-0 top-full mt-2 w-[330px] max-w-[90vw] rounded-xl border border-line bg-card shadow-pop">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <p className="font-display text-sm font-semibold">Notificações</p>
                  <button onClick={markNotifsRead} className="text-[11px] font-semibold text-brand-700 hover:underline">Marcar todas como lidas</button>
                </div>
                <div className="max-h-80 overflow-y-auto p-1.5">
                  {notifs.length === 0 && <p className="px-3 py-8 text-center text-xs text-ink-faint">Nenhuma notificação.</p>}
                  {notifs.slice(0, 10).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        if (n.ticketId) nav("chamado", { id: n.ticketId });
                        markNotifsRead();
                        setBell(false);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition hover:bg-paper ${n.read ? "opacity-60" : ""}`}
                    >
                      <span className={`mt-1 size-2 shrink-0 rounded-full ${n.kind === "sla" ? "bg-warn-500" : n.kind === "resolucao" ? "bg-ok-500" : "bg-brand-500"} ${n.read ? "" : "pulse-dot"}`} />
                      <span className="flex-1">
                        <span className="block text-[12.5px] leading-snug text-ink">{n.text}</span>
                        <span className="mt-0.5 block font-mono text-[10px] text-ink-faint">{timeAgo(n.at)}</span>
                      </span>
                    </button>
                  ))}
                </div>
                <p className="border-t border-line px-4 py-2 text-center text-[10px] text-ink-faint">E-mail ativo · Teams, WhatsApp e Push em breve</p>
              </div>
            )}
          </div>

          {/* Menu do usuário */}
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-lg border border-line py-1 pl-1 pr-2 transition hover:border-brand-400">
              <Avatar name={user.name} color={user.color} size={30} online={user.online} />
              <ChevronDown className="size-3.5 text-ink-faint" />
            </button>
            {menu && (
              <div className="anim-fade-up absolute right-0 top-full mt-2 w-60 rounded-xl border border-line bg-card p-1.5 shadow-pop">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-ink">{user.name}</p>
                  <p className="text-[11px] text-ink-faint">{user.email}</p>
                </div>
                <div className="mx-2 my-1 border-t border-line" />
                <button onClick={() => { logout(); toast("Sessão encerrada com segurança", "info"); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-danger-600 transition hover:bg-danger-100/60">
                  <LogOut className="size-4" /> Sair e trocar de perfil
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 pb-24 lg:pb-8">{children}</main>

      {/* Bottom nav — portal do usuário (mobile) */}
      {user.role === "usuario" && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-pine-800 bg-pine-900/97 backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2 pb-[env(safe-area-inset-bottom)]">
            {([
              { page: "home", label: "Início", icon: <LifeBuoy className="size-5" /> },
              { page: "catalogo", label: "Catálogo", icon: <PackageCheck className="size-5" /> },
              { page: "novo", label: "Abrir", icon: <Plus className="size-6" />, fab: true },
              { page: "chamados", label: "Chamados", icon: <Inbox className="size-5" /> },
              { page: "kb", label: "Ajuda", icon: <BookOpen className="size-5" /> },
            ] as { page: Page; label: string; icon: ReactNode; fab?: boolean }[]).map((it) => (
              <button key={it.page} onClick={() => nav(it.page)} className="flex flex-col items-center gap-0.5 py-2">
                {it.fab ? (
                  <span className={`-mt-5 grid size-12 place-items-center rounded-full text-white shadow-pop transition active:scale-95 ${route.page === it.page ? "bg-brand-500" : "bg-brand-600"}`}>
                    {it.icon}
                  </span>
                ) : (
                  <>
                    <span className={route.page === it.page ? "text-brand-200" : "text-pine-100/60"}>{it.icon}</span>
                    <span className={`text-[10px] font-semibold ${route.page === it.page ? "text-brand-200" : "text-pine-100/60"}`}>{it.label}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </nav>
      )}

      <ToastHost />
    </div>
  );
}

export function ToastHost() {
  const { toasts, dismissToast } = useApp();
  const icons = {
    ok: <CheckCircle2 className="size-4.5 text-ok-500" />,
    info: <Info className="size-4.5 text-skyx-600" />,
    warn: <AlertTriangle className="size-4.5 text-warn-500" />,
    danger: <XCircle className="size-4.5 text-danger-500" />,
  };
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[min(92vw,380px)] flex-col gap-2 lg:bottom-6">
      {toasts.map((t) => (
        <div key={t.id} className="anim-slide-r pointer-events-auto flex items-center gap-3 rounded-xl border border-line bg-pine-900 px-4 py-3 text-paper shadow-pop">
          {icons[t.kind]}
          <p className="flex-1 text-[13px] font-medium leading-snug">{t.text}</p>
          <button onClick={() => dismissToast(t.id)} className="text-pine-100/50 transition hover:text-paper" aria-label="Fechar aviso">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function PageHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="anim-fade-up mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[22px] font-bold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-ink-soft">{sub}</p>}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

export { MessageSquare };
