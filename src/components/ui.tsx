import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlarmClock, AppWindow, BookOpen, CheckCircle2, Clock, Code2, KeyRound,
  Mail, MonitorSmartphone, Printer, ShieldAlert, Star, Wifi, X, Phone,
} from "lucide-react";
import type { Category, Ticket } from "../data/data";
import { PRIORITY_META, STATUS_META, fmtDur, slaState, SLA_LABEL } from "../data/data";

// ── Marca ────────────────────────────────────────────────────
export function Logo({ dark = false, compact = false }: { dark?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative grid place-items-center size-9 shrink-0 rounded-xl bg-brand-500 shadow-[0_4px_14px_-4px_rgb(18_137_126/0.7)]">
        <svg viewBox="0 0 32 32" className="size-6" fill="none">
          <path d="M6 19c0-4 3-7 7-7 1-3 4-5 7-4 3 0 6 3 6 6 0 4-3 6-6 6H9c-2 0-3-1-3-1z" fill="#0B2E37" />
          <path d="M10 17h3l1.5-3 2.5 6 1.5-3H22" stroke="#F1F4F2" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-amberx-500 ring-2 ring-pine-900/40" />
      </div>
      {!compact && (
        <div className="leading-none">
          <span className={`font-display text-lg font-bold tracking-tight ${dark ? "text-paper" : "text-ink"}`}>
            Nimbus<span className="text-brand-500">Desk</span>
          </span>
          <span className={`block text-[10px] font-medium tracking-[0.18em] uppercase ${dark ? "text-pine-100/50" : "text-ink-faint"}`}>
            Central de Serviços
          </span>
        </div>
      )}
    </div>
  );
}

// ── Avatar ───────────────────────────────────────────────────
export function Avatar({ name, color, size = 36, online }: { name: string; color: string; size?: number; online?: boolean }) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="grid size-full place-items-center rounded-full font-display font-semibold text-white"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, fontSize: size * 0.36 }}
      >
        {initials}
      </div>
      {online && <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-ok-500 ring-2 ring-white" />}
    </div>
  );
}

// ── Pills ────────────────────────────────────────────────────
export function StatusPill({ status, className = "" }: { status: Ticket["status"]; className?: string }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${m.pill} ${className}`}>
      <span className={`size-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}
export function PriorityPill({ p, short = false }: { p: Ticket["priority"]; short?: boolean }) {
  const m = PRIORITY_META[p];
  return (
    <span className={`inline-flex items-center rounded-md border-l-[3px] bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-ink shadow-sm ${m.ring}`}>
      {short ? p : m.label}
    </span>
  );
}

// ── SLA ao vivo ──────────────────────────────────────────────
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function SlaChip({ ticket, verbose = false }: { ticket: Ticket; verbose?: boolean }) {
  const now = useNow(1000);
  const st = slaState(ticket);
  const left = ticket.resDue - now;
  const styles: Record<string, string> = {
    ok: "bg-ok-100 text-ok-600",
    warn: "bg-warn-100 text-warn-600",
    over: "bg-danger-100 text-danger-600",
    paused: "bg-[#e5eae8] text-ink-soft",
    done:
      ticket.resolvedAt && ticket.resolvedAt <= ticket.resDue
        ? "bg-ok-100 text-ok-600"
        : "bg-danger-100 text-danger-600",
  };
  const icon =
    st === "over" ? <AlarmClock className="size-3.5" /> : st === "done" ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />;
  let text = "";
  if (st === "done") text = ticket.resolvedAt && ticket.resolvedAt <= ticket.resDue ? "SLA cumprido" : "SLA estourado";
  else if (st === "paused") text = "SLA pausado";
  else text = left < 0 ? `-${fmtDur(left)}` : fmtDur(left);
  return (
    <span
      title={SLA_LABEL[st]}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] font-semibold whitespace-nowrap ${styles[st]}`}
    >
      <span className={st === "over" ? "pulse-dot" : ""}>{icon}</span>
      {text}
      {verbose && st !== "done" && st !== "paused" && <span className="font-sans font-medium opacity-70">· {SLA_LABEL[st].toLowerCase()}</span>}
    </span>
  );
}

// ── Estrelas ─────────────────────────────────────────────────
export function Stars({ value, onChange, size = 22 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          className={`transition-transform ${onChange ? "cursor-pointer hover:scale-125" : "cursor-default"}`}
          aria-label={`${i} estrelas`}
        >
          <Star
            style={{ width: size, height: size }}
            className={i <= active ? "fill-amberx-500 text-amberx-500" : "fill-line text-line-strong"}
          />
        </button>
      ))}
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, wide = false }: {
  open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center">
      <div className="anim-fade-in absolute inset-0 bg-pine-950/55 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`anim-slide-up relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-card shadow-pop sm:rounded-xl ${wide ? "sm:max-w-3xl" : "sm:max-w-lg"}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-card/95 px-5 py-4 backdrop-blur">
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="grid size-8 place-items-center rounded-lg text-ink-soft transition hover:bg-paper hover:text-ink" aria-label="Fechar">
            <X className="size-4.5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ── Campos ───────────────────────────────────────────────────
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-faint">{hint}</span>}
    </label>
  );
}
export const inputCls =
  "w-full rounded-lg border border-line-strong bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200";
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-brand-400 hover:text-brand-700 active:scale-[0.98]";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-danger-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-danger-600 active:scale-[0.98]";

// ── Animação de número ───────────────────────────────────────
export function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / duration);
      setVal(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

export function Kpi({ label, value, sub, accent, icon }: {
  label: string; value: string; sub?: ReactNode; accent?: string; icon?: ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-line bg-card p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="absolute inset-x-0 top-0 h-0.5 opacity-0 transition group-hover:opacity-100" style={{ background: accent ?? "var(--color-brand-500)" }} />
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold tracking-wider text-ink-faint uppercase">{label}</span>
        {icon && <span className="text-ink-faint transition group-hover:text-brand-600">{icon}</span>}
      </div>
      <div className="mt-1 font-display text-[26px] leading-none font-bold tracking-tight text-ink">{value}</div>
      {sub && <div className="mt-1.5 text-xs text-ink-soft">{sub}</div>}
    </div>
  );
}

// ── Gráficos SVG ─────────────────────────────────────────────
export function HBars({ data, unit = "" }: { data: { label: string; value: number; color?: string }[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={d.label} className="group/bar">
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate font-medium text-ink-soft">{d.label}</span>
            <span className="font-mono font-semibold text-ink">{d.value}{unit}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-paper">
            <div
              className="h-full origin-left rounded-full transition-all duration-700 group-hover/bar:brightness-110"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: d.color ?? "var(--color-brand-500)",
                animation: `grow-bar 0.8s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ pct, size = 132, stroke = 13, color = "var(--color-brand-500)", label, sub }: {
  pct: number; size?: number; stroke?: number; color?: string; label: string; sub?: string;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setShown(pct), 80);
    return () => window.clearTimeout(t);
  }, [pct]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-paper)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * shown) / 100}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-2xl font-bold text-ink">{label}</div>
        {sub && <div className="text-[10px] font-medium tracking-wide text-ink-faint uppercase">{sub}</div>}
      </div>
    </div>
  );
}

export function AreaChart({ series, labels, height = 170 }: {
  series: { name: string; color: string; values: number[] }[]; labels: string[]; height?: number;
}) {
  const W = 560;
  const H = height;
  const pad = { l: 34, r: 10, t: 12, b: 24 };
  const max = Math.max(...series.flatMap((s) => s.values)) * 1.15;
  const x = (i: number) => pad.l + (i / (labels.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const path = (vals: number[]) => vals.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = (vals: number[]) => `${path(vals)} L${x(vals.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const gridVals = useMemo(() => [0.25, 0.5, 0.75, 1].map((k) => max * k), [max]);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {gridVals.map((g) => (
          <g key={g}>
            <line x1={pad.l} x2={W - pad.r} y1={y(g)} y2={y(g)} stroke="var(--color-line)" strokeDasharray="3 5" />
            <text x={pad.l - 8} y={y(g) + 3} textAnchor="end" fontSize="9" fill="var(--color-ink-faint)" fontFamily="IBM Plex Mono">
              {Math.round(g)}
            </text>
          </g>
        ))}
        {labels.map((l, i) => (
          <text key={l} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--color-ink-faint)" fontFamily="IBM Plex Mono">
            {l}
          </text>
        ))}
        <path d={area(series[0].values)} fill={series[0].color} opacity="0.12" />
        {series.map((s) => (
          <path
            key={s.name} d={path(s.values)} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray={900} style={{ animation: "dash-draw 1.4s cubic-bezier(0.22,1,0.36,1) both", ["--dash" as string]: 900 }}
          />
        ))}
        {series.map((s) =>
          s.values.map((v, i) => (
            <circle key={`${s.name}${i}`} cx={x(i)} cy={y(v)} r={i === s.values.length - 1 ? 4.5 : 3} fill="white" stroke={s.color} strokeWidth="2.2">
              {i === s.values.length - 1 && <animate attributeName="r" values="4.5;5.6;4.5" dur="2s" repeatCount="indefinite" />}
            </circle>
          )),
        )}
      </svg>
      <div className="mt-1 flex flex-wrap items-center gap-4 px-1">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
            <span className="h-0.5 w-4 rounded-full" style={{ background: s.color }} /> {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MiniBars({ data, color = "var(--color-brand-500)", height = 90 }: {
  data: { label: string; value: number }[]; color?: string; height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={d.label} className="group flex flex-1 flex-col items-center gap-1.5">
          <span className="font-mono text-[10px] font-semibold text-ink-soft opacity-0 transition group-hover:opacity-100">{d.value}</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full origin-bottom rounded-t-md transition group-hover:brightness-110"
              style={{ height: `${(d.value / max) * 100}%`, background: color, animation: `grow-bar-y 0.7s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s both` }}
            />
          </div>
          <span className="text-[10px] font-medium text-ink-faint">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── QR Code (visual) ─────────────────────────────────────────
export function FakeQr({ seed, size = 168 }: { seed: string; size?: number }) {
  const cells = useMemo(() => {
    let h = 2166136261;
    for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
    const n = 21;
    const grid: boolean[] = [];
    for (let i = 0; i < n * n; i++) {
      h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
      grid.push(((h >>> 20) & 1) === 1);
    }
    return grid;
  }, [seed]);
  const n = 21;
  const cs = size / n;
  const finder = (ox: number, oy: number) => (
    <g>
      <rect x={ox * cs} y={oy * cs} width={7 * cs} height={7 * cs} fill="#0B2E37" />
      <rect x={(ox + 1) * cs} y={(oy + 1) * cs} width={5 * cs} height={5 * cs} fill="white" />
      <rect x={(ox + 2) * cs} y={(oy + 2) * cs} width={3 * cs} height={3 * cs} fill="#0E746C" />
    </g>
  );
  return (
    <svg width={size} height={size} className="rounded-lg bg-white" viewBox={`0 0 ${size} ${size}`}>
      {cells.map((on, i) => {
        const x = i % n, y = Math.floor(i / n);
        const inFinder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
        if (!on || inFinder) return null;
        return <rect key={i} x={x * cs + 0.5} y={y * cs + 0.5} width={cs - 1} height={cs - 1} rx={1} fill="#17252B" />;
      })}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}

// ── Ícones de categoria ──────────────────────────────────────
export function CatIcon({ catId, className = "size-5" }: { catId: string; className?: string }) {
  const map: Record<string, ReactNode> = {
    acessos: <KeyRound className={className} />,
    hardware: <MonitorSmartphone className={className} />,
    sistemas: <AppWindow className={className} />,
    m365: <Mail className={className} />,
    rede: <Wifi className={className} />,
    telefonia: <Phone className={className} />,
    impressao: <Printer className={className} />,
    seguranca: <ShieldAlert className={className} />,
    dev: <Code2 className={className} />,
  };
  return <>{map[catId] ?? <BookOpen className={className} />}</>;
}

export function CatChip({ cat, className = "" }: { cat: Category; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${className}`}
      style={{ background: `${cat.hue}1a`, color: cat.hue }}
    >
      <CatIcon catId={cat.id} className="size-3.5" />
      {cat.name}
    </span>
  );
}

// ── Vazio ────────────────────────────────────────────────────
export function Empty({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="anim-fade-up grid place-items-center rounded-xl border border-dashed border-line-strong bg-card/60 px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-paper">
        <BookOpen className="size-5 text-ink-faint" />
      </div>
      <p className="mt-3 font-display text-sm font-semibold text-ink">{title}</p>
      {sub && <p className="mt-1 max-w-sm text-xs text-ink-soft">{sub}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight text-ink">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-ink-soft">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-line bg-card ${className}`}>{children}</div>;
}

export function ProgressBar({ pct, color = "var(--color-brand-500)" }: { pct: number; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setW(pct), 100);
    return () => window.clearTimeout(t);
  }, [pct]);
  return (
    <div ref={ref} className="h-1.5 w-full overflow-hidden rounded-full bg-paper">
      <div className="h-full rounded-full" style={{ width: `${w}%`, background: color, transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }} />
    </div>
  );
}
