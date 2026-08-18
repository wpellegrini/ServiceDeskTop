import { useState } from "react";
import { Building2, Check, MapPin, Phone, Plus, Search, ShieldCheck, UserX, Users2, Workflow, X } from "lucide-react";
import { useApp } from "../store";
import { CATEGORIES, IMPACTS, PRIORITY_META, TEAMS, UNITS, teamById, unitById } from "../data/data";
import type { Level, Priority } from "../data/data";
import { Avatar, Card, CatIcon, SectionTitle, btnPrimary, inputCls } from "../components/ui";
import { PageHead } from "../components/shell";

const selCls = "rounded-lg border border-line-strong bg-white px-2.5 py-2 text-[12.5px] font-medium text-ink outline-none transition focus:border-brand-500";
const ROLE_LABEL: Record<string, string> = { usuario: "Usuário", tecnico: "Técnico", admin: "Admin" };

// ── Usuários ─────────────────────────────────────────────────
export function UsersAdmin() {
  const { users, toggleUser, toast, logAudit } = useApp();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("todos");

  const list = users.filter((u) => {
    if (role !== "todos" && u.role !== role) return false;
    const t = q.trim().toLowerCase();
    return !t || u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t) || u.dept.toLowerCase().includes(t);
  });

  return (
    <div>
      <PageHead
        title="Gestão de Usuários"
        sub="Cadastro, perfis de acesso (RBAC), unidades e situação de conta"
        right={<button onClick={() => toast("Assistente de cadastro disponível na API · POST /users", "info")} className={btnPrimary}><Plus className="size-4" /> Novo usuário</button>}
      />
      <Card className="anim-fade-up mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nome, e-mail ou setor…" className={`${inputCls} w-64 pl-9`} />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className={selCls}>
          <option value="todos">Perfil: todos</option>
          <option value="usuario">Usuários</option>
          <option value="tecnico">Técnicos</option>
          <option value="admin">Admins</option>
        </select>
        <span className="ml-auto font-mono text-[11.5px] text-ink-soft">{list.length} contas</span>
      </Card>
      <Card className="anim-fade-up overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-widest text-ink-faint uppercase">
              <th className="px-4 py-3">Usuário</th><th className="px-4 py-3">Perfil</th><th className="px-4 py-3">Unidade / Setor</th><th className="px-4 py-3">Equipe</th><th className="px-4 py-3">Situação</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-b border-line text-[12.5px] transition last:border-0 hover:bg-paper/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={u.name} color={u.color} size={32} online={u.online} />
                    <div>
                      <p className="font-semibold text-ink">{u.name}</p>
                      <p className="text-[11px] text-ink-faint">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${u.role === "admin" ? "bg-plum-100 text-plum-600" : u.role === "tecnico" ? "bg-brand-100 text-brand-700" : "bg-paper text-ink-soft"}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                </td>
                <td className="px-4 py-3"><p className="font-medium text-ink">{unitById(u.unitId)?.city}</p><p className="text-[11px] text-ink-faint">{u.dept}</p></td>
                <td className="px-4 py-3 text-ink-soft">{u.teamId ? teamById(u.teamId)?.name : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${u.active ? "bg-ok-100 text-ok-600" : "bg-danger-100 text-danger-600"}`}>
                    <span className={`size-1.5 rounded-full ${u.active ? "bg-ok-500" : "bg-danger-500"}`} /> {u.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { toggleUser(u.id); logAudit(u.active ? "Inativou usuário" : "Reativou usuário", u.name, u.active ? "Ativo" : "Inativo", u.active ? "Inativo" : "Ativo"); toast(`${u.name} ${u.active ? "inativado" : "reativado"} — registrado em auditoria`, u.active ? "warn" : "ok"); }}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-bold transition ${u.active ? "text-danger-600 hover:bg-danger-100" : "text-ok-600 hover:bg-ok-100"}`}
                  >
                    {u.active ? <><UserX className="size-3.5" /> Inativar</> : <><Check className="size-3.5" /> Reativar</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint"><ShieldCheck className="size-3.5" /> Controle de acesso baseado em perfil (RBAC) · alterações geram log de auditoria com IP e valores anterior/novo.</p>
    </div>
  );
}

// ── Técnicos & Equipes ───────────────────────────────────────
export function TechTeamsAdmin() {
  const { users, tickets, toast } = useApp();
  const techs = users.filter((u) => u.role === "tecnico");

  return (
    <div>
      <PageHead title="Técnicos & Equipes" sub="Especialidades, disponibilidade e carga de trabalho" right={<button onClick={() => toast("Gestão completa de equipes via API · /teams", "info")} className={btnPrimary}><Plus className="size-4" /> Nova equipe</button>} />
      <div className="stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {TEAMS.map((tm) => {
          const members = techs.filter((t) => t.teamId === tm.id);
          const load = tickets.filter((t) => t.teamId === tm.id && !["encerrado", "cancelado", "resolvido"].includes(t.status)).length;
          return (
            <Card key={tm.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-lg text-white" style={{ background: tm.color }}><Users2 className="size-4.5" /></span>
                <span className="rounded-full bg-paper px-2 py-0.5 font-mono text-[10.5px] font-bold text-ink-soft">{load} ativos</span>
              </div>
              <p className="mt-3 font-display text-[13.5px] font-bold text-ink">{tm.name}</p>
              <p className="text-[11px] text-ink-faint">Líder: {tm.lead}</p>
              <div className="mt-3 flex -space-x-1.5">
                {members.map((m) => <span key={m.id} className="rounded-full ring-2 ring-white"><Avatar name={m.name} color={m.color} size={26} online={m.online} /></span>)}
                {members.length === 0 && <p className="text-[11px] text-ink-faint">Sem membros</p>}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <SectionTitle title="Técnicos" sub="Especialidades e disponibilidade em tempo real" />
        <Card className="anim-fade-up overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-widest text-ink-faint uppercase">
                <th className="px-4 py-3">Técnico</th><th className="px-4 py-3">Equipe</th><th className="px-4 py-3">Especialidades</th><th className="px-4 py-3">Unidade</th><th className="px-4 py-3">Disponibilidade</th>
              </tr>
            </thead>
            <tbody>
              {techs.map((t) => (
                <tr key={t.id} className="border-b border-line text-[12.5px] transition last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={t.name} color={t.color} size={32} online={t.online} /><div><p className="font-semibold text-ink">{t.name}</p><p className="text-[11px] text-ink-faint">{t.title}</p></div></div></td>
                  <td className="px-4 py-3"><span className="rounded-full px-2.5 py-1 text-[10.5px] font-bold text-white" style={{ background: teamById(t.teamId)?.color }}>{teamById(t.teamId)?.name}</span></td>
                  <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{t.specialties?.map((s) => <span key={s} className="rounded-md bg-paper px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">{s}</span>)}</div></td>
                  <td className="px-4 py-3 text-ink-soft">{unitById(t.unitId)?.city}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold ${t.online ? "bg-ok-100 text-ok-600" : "bg-paper text-ink-faint"}`}>
                      <span className={`size-1.5 rounded-full ${t.online ? "bg-ok-500 pulse-dot" : "bg-ink-faint"}`} /> {t.online ? "Online" : "Offline"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ── Unidades ─────────────────────────────────────────────────
export function UnitsAdmin() {
  const { tickets } = useApp();
  return (
    <div>
      <PageHead title="Unidades Organizacionais" sub="Endereços, responsáveis, contatos e horário de atendimento" right={<button className={btnPrimary}><Plus className="size-4" /> Nova unidade</button>} />
      <div className="stagger grid gap-4 sm:grid-cols-2">
        {UNITS.map((u) => {
          const vol = tickets.filter((t) => t.unitId === u.id).length;
          return (
            <Card key={u.id} className="group overflow-hidden transition hover:shadow-lift">
              <div className="flex items-start justify-between border-b border-line bg-pine-900 px-5 py-4">
                <div>
                  <p className="flex items-center gap-2 font-display text-[15px] font-bold text-paper"><Building2 className="size-4.5 text-brand-300" /> {u.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-pine-100/60">{u.city}</p>
                </div>
                <span className="rounded-full bg-brand-500/20 px-2.5 py-1 font-mono text-[11px] font-bold text-brand-200">{vol} chamados</span>
              </div>
              <div className="space-y-2 px-5 py-4 text-[12.5px]">
                <p className="flex items-center gap-2.5 text-ink-soft"><MapPin className="size-4 text-brand-600" /> {u.address}</p>
                <p className="flex items-center gap-2.5 text-ink-soft"><Users2 className="size-4 text-brand-600" /> Responsável: <span className="font-semibold text-ink">{u.manager}</span></p>
                <p className="flex items-center gap-2.5 text-ink-soft"><Phone className="size-4 text-brand-600" /> {u.phone}</p>
                <p className="flex items-center gap-2.5 text-ink-soft"><ShieldCheck className="size-4 text-brand-600" /> Atendimento: <span className="font-mono font-semibold text-ink">{u.hours}</span></p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Catálogo & Serviços ──────────────────────────────────────
export function CatalogAdmin() {
  const { toast } = useApp();
  const [openCat, setOpenCat] = useState<string>(CATEGORIES[0].id);

  return (
    <div>
      <PageHead title="Catálogo & Serviços" sub="Configure SLA, equipe responsável, aprovação e formulários por serviço" right={<button onClick={() => toast("Editor de serviço disponível via API · /services", "info")} className={btnPrimary}><Plus className="size-4" /> Novo serviço</button>} />
      <div className="anim-fade-up grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit overflow-hidden">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setOpenCat(c.id)}
              className={`flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition last:border-0 ${openCat === c.id ? "bg-brand-50" : "hover:bg-paper"}`}>
              <span className="grid size-8 place-items-center rounded-lg" style={{ background: `${c.hue}14`, color: c.hue }}><CatIcon catId={c.id} className="size-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-ink">{c.name}</span>
                <span className="text-[10.5px] text-ink-faint">{c.services.length} serviços</span>
              </span>
              {openCat === c.id && <span className="size-2 rounded-full bg-brand-500" />}
            </button>
          ))}
        </Card>
        <Card className="overflow-hidden">
          {CATEGORIES.filter((c) => c.id === openCat).map((c) => (
            <div key={c.id}>
              <div className="border-b border-line px-5 py-4" style={{ boxShadow: `inset 3px 0 0 ${c.hue}` }}>
                <p className="font-display text-[15px] font-bold text-ink">{c.name}</p>
                <p className="text-[12px] text-ink-soft">{c.desc}</p>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-widest text-ink-faint uppercase">
                    <th className="px-5 py-2.5">Serviço</th><th className="px-3 py-2.5">Equipe</th><th className="px-3 py-2.5">1ª resp.</th><th className="px-3 py-2.5">Resolução</th><th className="px-3 py-2.5">Aprovação</th>
                  </tr>
                </thead>
                <tbody>
                  {c.services.map((s) => (
                    <tr key={s.id} className="border-b border-line text-[12.5px] transition last:border-0 hover:bg-paper/60">
                      <td className="px-5 py-3"><p className="font-semibold text-ink">{s.name}</p><p className="text-[11px] text-ink-faint">{s.desc}</p></td>
                      <td className="px-3 py-3"><span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white" style={{ background: teamById(s.teamId)?.color }}>{teamById(s.teamId)?.name.split(" ")[0]}</span></td>
                      <td className="px-3 py-3 font-mono font-semibold text-ink">{s.frH}h</td>
                      <td className="px-3 py-3 font-mono font-semibold text-ink">{s.resH}h</td>
                      <td className="px-3 py-3">
                        {s.approval
                          ? <span className="inline-flex items-center gap-1 rounded-full bg-plum-100 px-2 py-0.5 text-[10.5px] font-bold text-plum-600"><ShieldCheck className="size-3" /> obrigatória</span>
                          : <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink-faint"><X className="size-3" /> não</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </Card>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint"><Workflow className="size-3.5" /> Cada serviço possui formulário próprio configurável, prioridade padrão e metas de SLA herdadas pelas regras gerais.</p>
    </div>
  );
}

// ── Regras de SLA ────────────────────────────────────────────
export function SlaAdmin() {
  const { slaRules, updateSlaRule, toast, logAudit } = useApp();

  const set = (id: string, field: "frMin" | "resMin", value: number, label: string) => {
    const rule = slaRules.find((r) => r.id === id);
    if (!rule) return;
    const before = field === "frMin" ? `${rule.frMin}min` : `${rule.resMin}min`;
    updateSlaRule(id, { [field]: value });
    logAudit("Alterou regra de SLA", `${rule.priority} · ${rule.scope}`, `${label}: ${before}`, `${label}: ${value}min`);
    toast("Regra de SLA atualizada e auditada", "ok");
  };

  return (
    <div>
      <PageHead title="Regras de SLA" sub="Metas de primeira resposta e resolução por prioridade, considerando horário comercial (08h–18h, seg–sex)" />
      <Card className="anim-fade-up overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-widest text-ink-faint uppercase">
              <th className="px-4 py-3">Prioridade</th><th className="px-4 py-3">Abrangência</th><th className="px-4 py-3">1ª resposta (min)</th><th className="px-4 py-3">Resolução (min)</th><th className="px-4 py-3">Equivalente</th>
            </tr>
          </thead>
          <tbody>
            {slaRules.map((r) => (
              <tr key={r.id} className="border-b border-line text-[12.5px] transition last:border-0 hover:bg-paper/60">
                <td className="px-4 py-3"><span className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-bold ${PRIORITY_META[r.priority as Priority].pill}`}>{r.priority}</span></td>
                <td className="px-4 py-3 font-medium text-ink">{r.scope}</td>
                <td className="px-4 py-3">
                  <input type="number" defaultValue={r.frMin} key={`${r.id}-fr-${r.frMin}`}
                    onBlur={(e) => set(r.id, "frMin", Number(e.target.value), "1ª resposta")}
                    className="w-24 rounded-lg border border-line-strong bg-white px-2.5 py-1.5 font-mono text-[12px] outline-none focus:border-brand-500" />
                </td>
                <td className="px-4 py-3">
                  <input type="number" defaultValue={r.resMin} key={`${r.id}-res-${r.resMin}`}
                    onBlur={(e) => set(r.id, "resMin", Number(e.target.value), "Resolução")}
                    className="w-24 rounded-lg border border-line-strong bg-white px-2.5 py-1.5 font-mono text-[12px] outline-none focus:border-brand-500" />
                </td>
                <td className="px-4 py-3 font-mono text-[11.5px] text-ink-soft">{Math.round(r.resMin / 60)}h resolução</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="anim-fade-up mt-4 grid gap-3 sm:grid-cols-3">
        {([1, 2, 3, 4] as Level[]).slice(0, 3).map((l) => (
          <Card key={l} className="p-4">
            <p className="text-[10.5px] font-bold tracking-widest text-ink-faint uppercase">Calendário · {IMPACTS[l]}</p>
            <p className="mt-1.5 text-[13px] font-semibold text-ink">{l === 1 ? "Horário comercial" : l === 2 ? "Horário comercial" : "Horário comercial"}</p>
            <p className="text-[11.5px] text-ink-soft">Seg–sex · 08h às 18h · pausa de SLA em “Aguardando usuário”</p>
          </Card>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint"><ShieldCheck className="size-3.5" /> Alterações são versionadas na trilha de auditoria com valor anterior e novo.</p>
    </div>
  );
}


