import { useMemo, useState } from "react";
import { Activity, Award, Repeat, Target, Timer, TrendingUp } from "lucide-react";
import { useApp } from "../store";
import {
  CSAT_DIST, MONTHLY_SERIES, UNITS, catById, serviceById, unitById, userById,
} from "../data/data";
import { AreaChart, Avatar, Card, Donut, HBars, Kpi, SectionTitle, useCountUp } from "../components/ui";
import { PageHead } from "../components/shell";

const selCls = "rounded-lg border border-line-strong bg-white px-2.5 py-2 text-[12.5px] font-medium text-ink outline-none transition focus:border-brand-500";

export function AdminDashboard() {
  const { tickets, nav } = useApp();
  const [period, setPeriod] = useState(6);
  const [unit, setUnit] = useState("todas");

  const monthTickets = useCountUp(247);
  const slaPct = useCountUp(93);
  const csat = useCountUp(4.7);

  const scoped = useMemo(
    () => tickets.filter((t) => unit === "todas" || t.unitId === unit),
    [tickets, unit],
  );

  const byUnit = UNITS.map((u) => ({
    label: u.city,
    value: tickets.filter((t) => t.unitId === u.id).length,
    color: "#12897e",
  })).sort((a, b) => b.value - a.value);

  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    scoped.forEach((t) => m.set(t.catId, (m.get(t.catId) ?? 0) + 1));
    return [...m.entries()]
      .map(([id, value]) => ({ label: catById(id)?.name ?? id, value, color: catById(id)?.hue }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [scoped]);

  const byTech = useMemo(() => {
    const m = new Map<string, { total: number; rated: number; stars: number }>();
    scoped.forEach((t) => {
      if (!t.techId) return;
      const cur = m.get(t.techId) ?? { total: 0, rated: 0, stars: 0 };
      cur.total += 1;
      if (t.rating) { cur.rated += 1; cur.stars += t.rating.stars; }
      m.set(t.techId, cur);
    });
    return [...m.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [scoped]);

  const recorrentes = useMemo(() => {
    const m = new Map<string, number>();
    tickets.forEach((t) => {
      const name = serviceById(t.serviceId)?.service.name ?? "—";
      m.set(name, (m.get(name) ?? 0) + 1);
    });
    return [...m.entries()].filter(([, v]) => v >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [tickets]);

  const series = MONTHLY_SERIES.slice(-period);

  return (
    <div>
      <PageHead
        title="Dashboard Executivo"
        sub="Visão consolidada da Central de Serviços — indicadores ao vivo de toda a operação"
        right={
          <>
            <select value={period} onChange={(e) => setPeriod(Number(e.target.value))} className={selCls}>
              <option value={3}>Últimos 3 meses</option>
              <option value={6}>Últimos 6 meses</option>
            </select>
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className={selCls}>
              <option value="todas">Todas as unidades</option>
              {UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </>
        }
      />

      <div className="stagger grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi label="Chamados no mês" value={String(Math.round(monthTickets))} icon={<Activity className="size-4" />} sub={<span className="text-ok-600 font-semibold">▲ 12% vs mês anterior</span>} />
        <Kpi label="SLA atendido" value={`${Math.round(slaPct)}%`} icon={<Target className="size-4" />} accent="var(--color-ok-500)" sub="meta corporativa: 90%" />
        <Kpi label="Resolução média" value="2h18" icon={<Timer className="size-4" />} accent="var(--color-warn-500)" sub={<span className="text-ok-600 font-semibold">▼ 14min vs mês anterior</span>} />
        <Kpi label="Satisfação (CSAT)" value={`${csat.toFixed(1)} / 5`} icon={<Award className="size-4" />} accent="var(--color-amberx-500)" sub={`${CSAT_DIST.reduce((s, d) => s + d.value, 0)} avaliações no mês`} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <Card className="anim-fade-up p-5 xl:col-span-2">
          <SectionTitle title="Evolução mensal" sub="Chamados abertos × encerrados" right={<span className="font-mono text-[11px] text-ink-faint">{series.length} meses</span>} />
          <AreaChart
            labels={series.map((s) => s.label)}
            series={[
              { name: "Abertos", color: "var(--color-brand-500)", values: series.map((s) => s.open) },
              { name: "Encerrados", color: "var(--color-amberx-500)", values: series.map((s) => s.closed) },
            ]}
          />
        </Card>

        <div className="space-y-5">
          <Card className="anim-fade-up flex items-center gap-5 p-5">
            <Donut pct={93} label={`${Math.round(slaPct)}%`} sub="SLA cumprido" color="var(--color-ok-500)" />
            <div className="space-y-2 text-[12px]">
              <p className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-ok-500" /> <span className="text-ink-soft">Dentro do prazo</span> <span className="ml-auto font-mono font-bold text-ink">230</span></p>
              <p className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-warn-500" /> <span className="text-ink-soft">No limite (±15min)</span> <span className="ml-auto font-mono font-bold text-ink">9</span></p>
              <p className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-danger-500" /> <span className="text-ink-soft">Vencidos</span> <span className="ml-auto font-mono font-bold text-ink">8</span></p>
            </div>
          </Card>
          <Card className="anim-fade-up p-5">
            <SectionTitle title="Satisfação dos usuários" sub="Distribuição das avaliações" />
            <HBars data={CSAT_DIST.map((d) => ({ ...d, color: d.label.startsWith("5") || d.label.startsWith("4") ? "var(--color-ok-500)" : d.label.startsWith("3") ? "var(--color-warn-500)" : "var(--color-danger-500)" }))} />
          </Card>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="anim-fade-up p-5">
          <SectionTitle title="Chamados por unidade" sub="Volume do período selecionado" />
          <HBars data={byUnit} />
        </Card>
        <Card className="anim-fade-up p-5">
          <SectionTitle title="Chamados por categoria" sub={unit === "todas" ? "Todas as unidades" : unitById(unit)?.name} />
          <HBars data={byCat} />
        </Card>
        <Card className="anim-fade-up p-5">
          <SectionTitle title="Desempenho por técnico" sub="Volume e satisfação individual" />
          <ul className="space-y-3">
            {byTech.map((t) => {
              const u = userById(t.id);
              const csatTech = t.rated ? (t.stars / t.rated).toFixed(1) : "—";
              return (
                <li key={t.id} className="flex items-center gap-3">
                  <Avatar name={u?.name ?? "?"} color={u?.color ?? "#888"} size={32} online={u?.online} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">{u?.name}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${(t.total / (byTech[0]?.total || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[13px] font-bold text-ink">{t.total}</p>
                    <p className="text-[10px] text-ink-faint">★ {csatTech}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="anim-fade-up p-5">
          <SectionTitle
            title="Problemas recorrentes"
            sub="Detectados automaticamente por padrão de serviço"
            right={<span className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[10.5px] font-bold text-brand-700 ring-1 ring-brand-200"><Repeat className="size-3" /> detector ativo</span>}
          />
          <ul className="space-y-2">
            {recorrentes.map(([name, count]) => (
              <li key={name} className="flex items-center gap-3 rounded-lg border border-line bg-paper/50 px-3.5 py-2.5 transition hover:border-brand-300">
                <span className="grid size-8 place-items-center rounded-lg bg-warn-100 font-mono text-[13px] font-bold text-warn-600">{count}×</span>
                <span className="flex-1 text-[13px] font-semibold text-ink">{name}</span>
                <button onClick={() => nav("admin-relatorios")} className="text-[11px] font-semibold text-brand-700 hover:underline">analisar</button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
            <TrendingUp className="mr-1 inline size-3.5" />
            Sugestão: publicar artigo preventivo na Base de Conhecimento para os 2 serviços mais recorrentes reduziria ~18% do volume.
          </p>
        </Card>
        <Card className="anim-fade-up p-5">
          <SectionTitle title="Serviços mais solicitados" sub="Ranking do período" />
          <HBars
            data={topServices(tickets)}
          />
          <p className="mt-4 rounded-lg bg-pine-900 px-4 py-3 text-[12px] leading-relaxed text-pine-100/80">
            <span className="font-bold text-paper">Dashboard gerencial por unidade:</span> cada gestor visualiza apenas os indicadores da sua unidade — volume, SLA, satisfação e recorrências.
          </p>
        </Card>
      </div>
    </div>
  );
}

function topServices(tickets: ReturnType<typeof useApp>["tickets"]) {
  const m = new Map<string, number>();
  tickets.forEach((t) => {
    const name = serviceById(t.serviceId)?.service.name ?? "—";
    m.set(name, (m.get(name) ?? 0) + 1);
  });
  return [...m.entries()]
    .map(([label, value]) => ({ label, value, color: "var(--color-pine-600)" }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}
