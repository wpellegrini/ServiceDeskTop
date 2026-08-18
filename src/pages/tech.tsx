import { useMemo, useState } from "react";
import {
  AlarmClock, CheckCircle2, ChevronRight, Clock3, Filter, Flame, Inbox, Star,
  TrendingUp, UserCheck, Users2,
} from "lucide-react";
import { useApp } from "../store";
import {
  TECH_PRODUCTIVITY, UNITS, STATUS_META, catById, fmtDT, slaState, timeAgo,
  unitById, userById, PRIORITY_META,
} from "../data/data";
import type { Priority, Ticket, TicketStatus } from "../data/data";
import { Avatar, Card, Empty, Kpi, MiniBars, PriorityPill, SectionTitle, SlaChip, StatusPill, btnPrimary, inputCls } from "../components/ui";
import { PageHead } from "../components/shell";
import { TicketRow } from "./portal";

// ── Dashboard do técnico ─────────────────────────────────────
export function TechDashboard() {
  const { user, tickets, nav, favorites } = useApp();
  const mine = useMemo(() => tickets.filter((t) => t.techId === user?.id), [tickets, user]);
  const active = mine.filter((t) => !["encerrado", "cancelado", "resolvido"].includes(t.status));
  const newOnes = tickets.filter((t) => t.status === "novo" && !t.techId);
  const waitingUser = active.filter((t) => t.status === "aguardando_usuario");
  const nearSla = active.filter((t) => slaState(t) === "warn");
  const overdue = active.filter((t) => slaState(t) === "over");
  const today = new Date().setHours(0, 0, 0, 0);
  const resolvedToday = tickets.filter((t) => t.resolvedAt && t.resolvedAt >= today).length;

  const myRated = tickets.filter((t) => t.techId === user?.id && t.rating);
  const csat = myRated.length ? myRated.reduce((s, t) => s + (t.rating?.stars ?? 0), 0) / myRated.length : 0;

  const priorityQueue = [...active]
    .sort((a, b) => {
      const rank = (t: Ticket) => (slaState(t) === "over" ? 0 : slaState(t) === "warn" ? 1 : 2);
      return rank(a) - rank(b) || a.resDue - b.resDue;
    })
    .slice(0, 6);

  return (
    <div>
      <PageHead
        title={`Painel de ${user?.name.split(" ")[0]}`}
        sub="Sua fila pessoal, SLA e produtividade em tempo real"
        right={<button onClick={() => nav("fila")} className={btnPrimary}><Inbox className="size-4" /> Abrir fila completa</button>}
      />

      <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Novos na fila" value={String(newOnes.length)} icon={<Inbox className="size-4" />} sub="sem técnico atribuído" />
        <Kpi label="Em atendimento" value={String(active.length)} icon={<UserCheck className="size-4" />} accent="var(--color-brand-500)" sub="atribuídos a você" />
        <Kpi label="Aguard. usuário" value={String(waitingUser.length)} icon={<Clock3 className="size-4" />} accent="var(--color-warn-500)" sub="SLA pausado" />
        <Kpi label="SLA próximo" value={String(nearSla.length)} icon={<AlarmClock className="size-4" />} accent="var(--color-warn-500)" sub="vence em até 4h" />
        <Kpi label="SLA vencido" value={String(overdue.length)} icon={<Flame className="size-4" />} accent="var(--color-danger-500)" sub="ação imediata" />
        <Kpi label="Resolvidos hoje" value={String(resolvedToday)} icon={<CheckCircle2 className="size-4" />} accent="var(--color-ok-500)" sub="toda a equipe" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <SectionTitle title="Minha fila prioritária" sub="Ordenada por risco de SLA e prazo de resolução" />
          <Card className="anim-fade-up overflow-hidden">
            {priorityQueue.map((t) => <TicketRow key={t.id} t={t} highlight={slaState(t) !== "ok" && slaState(t) !== "paused"} />)}
            {priorityQueue.length === 0 && <Empty title="Fila limpa! 🎉" sub="Nenhum chamado ativo atribuído a você." action={<button onClick={() => nav("fila")} className={btnPrimary}>Ver fila da equipe</button>} />}
          </Card>
          {favorites.length > 0 && (
            <div className="mt-6">
              <SectionTitle title="Chamados favoritos" sub="Marcados por você para acompanhamento próximo" />
              <Card className="overflow-hidden">
                {tickets.filter((t) => favorites.includes(t.id)).map((t) => <TicketRow key={t.id} t={t} />)}
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="anim-fade-up p-4">
            <p className="font-display text-sm font-bold text-ink">Produtividade da semana</p>
            <p className="text-[11.5px] text-ink-soft">Chamados resolvidos por dia</p>
            <div className="mt-3">
              <MiniBars data={TECH_PRODUCTIVITY} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-paper p-2.5 text-center">
                <p className="font-display text-lg font-bold text-brand-700">{TECH_PRODUCTIVITY.reduce((s, d) => s + d.value, 0)}</p>
                <p className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">na semana</p>
              </div>
              <div className="rounded-lg bg-paper p-2.5 text-center">
                <p className="font-display text-lg font-bold text-brand-700">{csat ? csat.toFixed(1) : "—"}</p>
                <p className="text-[10px] font-semibold tracking-wide text-ink-faint uppercase">seu CSAT</p>
              </div>
            </div>
          </Card>

          <Card className="anim-fade-up p-4">
            <p className="flex items-center gap-2 font-display text-sm font-bold text-ink"><TrendingUp className="size-4 text-brand-600" /> Seu desempenho</p>
            <div className="mt-3 space-y-2.5 text-[12.5px]">
              <div className="flex justify-between"><span className="text-ink-soft">Tempo médio de 1ª resposta</span><span className="font-mono font-semibold text-ink">38min</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Tempo médio de resolução</span><span className="font-mono font-semibold text-ink">2h41</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">Taxa de reabertura</span><span className="font-mono font-semibold text-ok-600">3,2%</span></div>
              <div className="flex justify-between"><span className="text-ink-soft">SLA cumprido (mês)</span><span className="font-mono font-semibold text-ok-600">94%</span></div>
            </div>
          </Card>

          <Card className="anim-fade-up p-4">
            <p className="flex items-center gap-2 font-display text-sm font-bold text-ink"><Users2 className="size-4 text-brand-600" /> Equipe online</p>
            <ul className="mt-2.5 space-y-2">
              {["p3", "p4", "p5", "p6", "p7", "p8"].map((id) => {
                const u = userById(id);
                if (!u) return null;
                const load = tickets.filter((t) => t.techId === id && !["encerrado", "cancelado", "resolvido"].includes(t.status)).length;
                return (
                  <li key={id} className="flex items-center gap-2.5">
                    <Avatar name={u.name} color={u.color} size={28} online={u.online} />
                    <span className="flex-1 truncate text-[12.5px] font-medium text-ink">{u.name}</span>
                    <span className="rounded-full bg-paper px-2 py-0.5 font-mono text-[10.5px] font-semibold text-ink-soft">{load} ativos</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Fila de atendimento ──────────────────────────────────────
export function QueuePage() {
  const { tickets, nav, user, favorites, toggleFavorite, toast } = useApp();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("abertos");
  const [prio, setPrio] = useState<string>("todas");
  const [unit, setUnit] = useState<string>("todas");
  const [sla, setSla] = useState<string>("todos");
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyFav, setOnlyFav] = useState(false);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return tickets
      .filter((t) => {
        if (status === "abertos" && ["encerrado", "cancelado"].includes(t.status)) return false;
        if (status !== "abertos" && status !== "todos" && t.status !== status) return false;
        if (prio !== "todas" && t.priority !== prio) return false;
        if (unit !== "todas" && t.unitId !== unit) return false;
        if (sla !== "todos" && slaState(t) !== sla) return false;
        if (onlyMine && t.techId !== user?.id) return false;
        if (onlyFav && !favorites.includes(t.id)) return false;
        if (term) {
          const req = userById(t.requesterId);
          const hay = `${t.code} ${t.title} ${t.description} ${req?.name ?? ""} ${catById(t.catId)?.name ?? ""}`.toLowerCase();
          if (!hay.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const rank = (t: Ticket) => (t.priority === "P1" ? 0 : t.priority === "P2" ? 1 : t.priority === "P3" ? 2 : 3);
        return rank(a) - rank(b) || a.resDue - b.resDue;
      });
  }, [tickets, q, status, prio, unit, sla, onlyMine, onlyFav, favorites, user]);

  const counts = {
    over: tickets.filter((t) => slaState(t) === "over").length,
    warn: tickets.filter((t) => slaState(t) === "warn").length,
    new: tickets.filter((t) => t.status === "novo").length,
  };

  const selCls = "rounded-lg border border-line-strong bg-white px-2.5 py-2 text-[12.5px] font-medium text-ink outline-none transition focus:border-brand-500";

  return (
    <div>
      <PageHead title="Fila de Atendimento" sub="Todos os chamados da operação, com SLA ao vivo e filtros combinados" />

      <div className="stagger mb-4 grid grid-cols-3 gap-3">
        <button onClick={() => { setSla("over"); setStatus("todos"); }} className={`rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-lift ${sla === "over" ? "border-danger-500 bg-danger-100/60" : "border-line bg-card"}`}>
          <p className="font-display text-2xl font-bold text-danger-600">{counts.over}</p>
          <p className="text-[11px] font-semibold tracking-wide text-ink-soft uppercase">SLA vencido</p>
        </button>
        <button onClick={() => { setSla("warn"); setStatus("todos"); }} className={`rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-lift ${sla === "warn" ? "border-warn-500 bg-warn-100/60" : "border-line bg-card"}`}>
          <p className="font-display text-2xl font-bold text-warn-600">{counts.warn}</p>
          <p className="text-[11px] font-semibold tracking-wide text-ink-soft uppercase">Próximos do SLA</p>
        </button>
        <button onClick={() => { setStatus("novo"); setSla("todos"); }} className={`rounded-xl border p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-lift ${status === "novo" ? "border-skyx-600 bg-skyx-100/60" : "border-line bg-card"}`}>
          <p className="font-display text-2xl font-bold text-skyx-600">{counts.new}</p>
          <p className="text-[11px] font-semibold tracking-wide text-ink-soft uppercase">Novos sem triagem</p>
        </button>
      </div>

      {/* Filtros */}
      <Card className="anim-fade-up mb-4 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="size-4 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nº, título, usuário, categoria…" className={`${inputCls} w-full max-w-[220px] py-2 text-[12.5px]`} />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selCls}>
            <option value="todos">Status: todos</option>
            <option value="abertos">Somente abertos</option>
            {(["novo", "triagem", "atendimento", "aguardando_usuario", "aguardando_terceiro", "aguardando_aprovacao", "desenvolvimento", "resolvido", "encerrado", "cancelado"] as TicketStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
          <select value={prio} onChange={(e) => setPrio(e.target.value)} className={selCls}>
            <option value="todas">Prioridade: todas</option>
            {(["P1", "P2", "P3", "P4"] as Priority[]).map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
          </select>
          <select value={unit} onChange={(e) => setUnit(e.target.value)} className={selCls}>
            <option value="todas">Unidade: todas</option>
            {UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select value={sla} onChange={(e) => setSla(e.target.value)} className={selCls}>
            <option value="todos">SLA: todos</option>
            <option value="ok">🟢 dentro</option>
            <option value="warn">🟡 próximo</option>
            <option value="over">🔴 vencido</option>
            <option value="paused">pausado</option>
          </select>
          <button onClick={() => setOnlyMine((v) => !v)} className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${onlyMine ? "bg-pine-900 text-paper" : "border border-line-strong bg-white text-ink-soft hover:text-brand-700"}`}>
            Meus chamados
          </button>
          <button onClick={() => setOnlyFav((v) => !v)} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${onlyFav ? "bg-amberx-500 text-white" : "border border-line-strong bg-white text-ink-soft hover:text-brand-700"}`}>
            <Star className={`size-3.5 ${onlyFav ? "fill-white" : ""}`} /> Favoritos
          </button>
          <span className="ml-auto font-mono text-[11.5px] font-semibold text-ink-soft">{filtered.length} resultado(s)</span>
        </div>
      </Card>

      {/* Tabela desktop */}
      <Card className="anim-fade-up hidden overflow-hidden lg:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-widest text-ink-faint uppercase">
              <th className="px-3 py-3">Chamado</th>
              <th className="px-3 py-3">Usuário / Unidade</th>
              <th className="px-3 py-3">Categoria</th>
              <th className="px-3 py-3">Prio</th>
              <th className="px-3 py-3">SLA</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Abertura</th>
              <th className="px-3 py-3">Técnico</th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const req = userById(t.requesterId);
              const cat = catById(t.catId);
              const tech = userById(t.techId);
              return (
                <tr key={t.id} onClick={() => nav("chamado", { id: t.id })}
                  className="group cursor-pointer border-b border-line text-[12.5px] transition last:border-0 hover:bg-brand-50/60">
                  <td className="px-3 py-3">
                    <span className="font-mono text-[11.5px] font-bold text-brand-700">{t.code}</span>
                    <span className="mt-0.5 block max-w-[220px] truncate font-semibold text-ink">{t.title}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="block font-medium text-ink">{req?.name}</span>
                    <span className="text-[11px] text-ink-faint">{unitById(t.unitId)?.city}</span>
                  </td>
                  <td className="px-3 py-3"><span className="font-medium text-ink-soft">{cat?.name}</span></td>
                  <td className="px-3 py-3"><PriorityPill p={t.priority} short /></td>
                  <td className="px-3 py-3"><SlaChip ticket={t} /></td>
                  <td className="px-3 py-3"><StatusPill status={t.status} /></td>
                  <td className="px-3 py-3"><span className="font-mono text-[11px] text-ink-soft" title={fmtDT(t.createdAt)}>{timeAgo(t.createdAt)}</span></td>
                  <td className="px-3 py-3">
                    {tech ? (
                      <span className="flex items-center gap-1.5"><Avatar name={tech.name} color={tech.color} size={22} /><span className="text-[11.5px] font-medium text-ink">{tech.name.split(" ")[0]}</span></span>
                    ) : (
                      <span className="rounded-full bg-warn-100 px-2 py-0.5 text-[10.5px] font-bold text-warn-600">não atribuído</span>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(t.id); toast(favorites.includes(t.id) ? "Removido dos favoritos" : "Chamado favoritado", "info"); }}
                        className="grid size-7 place-items-center rounded-lg transition hover:bg-amberx-100"
                        aria-label="Favoritar"
                      >
                        <Star className={`size-4 ${favorites.includes(t.id) ? "fill-amberx-500 text-amberx-500" : "text-ink-faint"}`} />
                      </button>
                      <ChevronRight className="size-4 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <Empty title="Nenhum chamado com esses filtros" sub="Ajuste os filtros acima para ampliar a busca." />}
      </Card>

      {/* Cards mobile */}
      <div className="anim-fade-up space-y-3 lg:hidden">
        {filtered.map((t) => {
          const req = userById(t.requesterId);
          const tech = userById(t.techId);
          return (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => nav("chamado", { id: t.id })} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand-700">{t.code}</span>
                    <PriorityPill p={t.priority} short />
                  </div>
                  <p className="mt-1 text-[13.5px] leading-snug font-semibold text-ink">{t.title}</p>
                  <p className="mt-1 text-[11.5px] text-ink-faint">{req?.name} · {unitById(t.unitId)?.city} · {timeAgo(t.createdAt)}</p>
                </button>
                <button onClick={() => toggleFavorite(t.id)} className="grid size-8 shrink-0 place-items-center rounded-lg" aria-label="Favoritar">
                  <Star className={`size-4.5 ${favorites.includes(t.id) ? "fill-amberx-500 text-amberx-500" : "text-ink-faint"}`} />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusPill status={t.status} />
                <SlaChip ticket={t} />
                {tech ? (
                  <span className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
                    <Avatar name={tech.name} color={tech.color} size={20} /> {tech.name.split(" ")[0]}
                  </span>
                ) : (
                  <span className="ml-auto text-[11px] font-bold text-warn-600">não atribuído</span>
                )}
              </div>
            </Card>
          );
        })}
        {filtered.length === 0 && <Empty title="Nenhum chamado com esses filtros" sub="Ajuste os filtros para ampliar a busca." />}
      </div>
    </div>
  );
}
