import { useMemo, useState } from "react";
import {
  BookOpen, Eye, FileSpreadsheet, History, Lock,
  MonitorSmartphone, Plus, Printer, QrCode, Search, Sparkles, ToggleLeft,
} from "lucide-react";
import { useApp } from "../store";
import { ASSETS, CATEGORIES, UNITS, assetById, catById, fmtD, fmtDT, timeAgo, unitById, userById } from "../data/data";
import type { Article } from "../data/data";
import { Card, CatChip, Empty, FakeQr, Modal, SectionTitle, btnGhost, btnPrimary, inputCls } from "../components/ui";
import { PageHead } from "../components/shell";

const selCls = "rounded-lg border border-line-strong bg-white px-2.5 py-2 text-[12.5px] font-medium text-ink outline-none transition focus:border-brand-500";

// ── Ativos ───────────────────────────────────────────────────
export function AssetsAdmin() {
  const { nav, setPrefill, toast, tickets } = useApp();
  const [q, setQ] = useState("");
  const [unit, setUnit] = useState("todas");
  const [qrAsset, setQrAsset] = useState<string | null>(null);

  const list = ASSETS.filter((a) => {
    if (unit !== "todas" && a.unitId !== unit) return false;
    const t = q.trim().toLowerCase();
    return !t || [a.tag, a.type, a.maker, a.model, a.serial, a.location].some((s) => s.toLowerCase().includes(t));
  });
  const asset = qrAsset ? assetById(qrAsset) : undefined;
  const assetTickets = asset ? tickets.filter((t) => t.assetId === asset.id) : [];

  return (
    <div>
      <PageHead
        title="Ativos de TI"
        sub="Inventário com patrimônio, garantia e QR Code para abertura rápida de chamado"
        right={<button onClick={() => toast("Importação de inventário via CSV disponível na API", "info")} className={btnPrimary}><Plus className="size-4" /> Cadastrar ativo</button>}
      />
      <Card className="anim-fade-up mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Patrimônio, série, modelo, local…" className={`${inputCls} w-72 pl-9`} />
        </div>
        <select value={unit} onChange={(e) => setUnit(e.target.value)} className={selCls}>
          <option value="todas">Todas as unidades</option>
          {UNITS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <span className="ml-auto font-mono text-[11.5px] text-ink-soft">{list.length} ativos</span>
      </Card>
      <Card className="anim-fade-up overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead>
            <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-widest text-ink-faint uppercase">
              <th className="px-4 py-3">Patrimônio</th><th className="px-4 py-3">Equipamento</th><th className="px-4 py-3">Usuário</th><th className="px-4 py-3">Unidade / Local</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Garantia</th><th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {list.map((a) => {
              const stCls = a.status === "em uso" ? "bg-brand-100 text-brand-700" : a.status === "disponível" ? "bg-ok-100 text-ok-600" : a.status === "manutenção" ? "bg-warn-100 text-warn-600" : "bg-danger-100 text-danger-600";
              return (
                <tr key={a.id} className="border-b border-line text-[12.5px] transition last:border-0 hover:bg-paper/60">
                  <td className="px-4 py-3"><span className="font-mono text-[12px] font-bold text-brand-700">{a.tag}</span><p className="text-[10.5px] text-ink-faint">{a.serial}</p></td>
                  <td className="px-4 py-3"><p className="font-semibold text-ink">{a.type} {a.model}</p><p className="text-[11px] text-ink-faint">{a.maker} · {a.supplier}</p></td>
                  <td className="px-4 py-3 text-ink-soft">{a.userId ? userById(a.userId)?.name : "—"}</td>
                  <td className="px-4 py-3"><p className="font-medium text-ink">{unitById(a.unitId)?.city}</p><p className="text-[11px] text-ink-faint">{a.location}</p></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${stCls}`}>{a.status}</span></td>
                  <td className="px-4 py-3 font-mono text-[11.5px] text-ink-soft">{a.warranty}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setQrAsset(a.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-pine-900 px-3 py-1.5 text-[11.5px] font-bold text-paper transition hover:bg-pine-800">
                      <QrCode className="size-3.5" /> QR Code
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <Empty title="Nenhum ativo encontrado" sub="Ajuste a busca ou os filtros." />}
      </Card>

      <Modal open={!!asset} onClose={() => setQrAsset(null)} title={asset ? `${asset.tag} · ${asset.type} ${asset.model}` : ""}>
        {asset && (
          <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
            <div className="mx-auto">
              <div className="rounded-xl border-4 border-pine-900 p-2 shadow-lift"><FakeQr seed={asset.tag + asset.serial} /></div>
              <p className="mt-2 text-center font-mono text-[10px] text-ink-faint">desk.vetra.com.br/a/{asset.tag}</p>
            </div>
            <div>
              <p className="text-[13px] leading-relaxed text-ink-soft">
                Ao escanear, o colaborador cai direto em <span className="font-semibold text-ink">“Abrir chamado para este equipamento”</span> com patrimônio, unidade e localização já identificados.
              </p>
              <div className="mt-3 space-y-1.5 text-[12px]">
                <p><span className="font-semibold text-ink-soft">Localização:</span> <span className="text-ink">{asset.location}</span></p>
                <p><span className="font-semibold text-ink-soft">Unidade:</span> <span className="text-ink">{unitById(asset.unitId)?.name}</span></p>
                <p><span className="font-semibold text-ink-soft">Histórico:</span> <span className="text-ink">{assetTickets.length} chamado(s) vinculado(s)</span></p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => { setPrefill({ assetId: asset.id, serviceId: "s-pc" }); setQrAsset(null); nav("novo"); }}
                  className={btnPrimary}
                >
                  <MonitorSmartphone className="size-4" /> Abrir chamado para este equipamento
                </button>
                <button onClick={() => toast("Etiqueta PDF gerada para impressão", "ok")} className={btnGhost}>
                  <Printer className="size-4" /> Imprimir etiqueta
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Base de Conhecimento ─────────────────────────────────────
export function KbPage() {
  const { user, articles, addArticle, toast } = useApp();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("todas");
  const [open, setOpen] = useState<Article | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [nTitle, setNTitle] = useState("");
  const [nCat, setNCat] = useState("rede");
  const [nKeys, setNKeys] = useState("");
  const [nBody, setNBody] = useState("");
  const isAdmin = user?.role === "admin";

  const list = articles.filter((a) => {
    if (cat !== "todas" && a.catId !== cat) return false;
    const t = q.trim().toLowerCase();
    return !t || a.title.toLowerCase().includes(t) || a.keywords.some((k) => k.includes(t));
  });

  const publish = () => {
    addArticle({
      id: `kb-novo-${Date.now()}`, title: nTitle.trim(), catId: nCat,
      keywords: nKeys.split(",").map((k) => k.trim().toLowerCase()).filter(Boolean),
      summary: nBody.slice(0, 120), body: nBody.split("\n").filter(Boolean),
      author: user?.name ?? "Equipe TI", updatedAt: Date.now(), views: 0, version: "1.0",
    });
    toast("Artigo publicado na Base de Conhecimento", "ok");
    setNewOpen(false); setNTitle(""); setNKeys(""); setNBody("");
  };

  return (
    <div>
      <PageHead
        title="Base de Conhecimento"
        sub="Soluções documentadas para resolver sem abrir chamado — sugeridas automaticamente na abertura"
        right={isAdmin ? <button onClick={() => setNewOpen(true)} className={btnPrimary}><Plus className="size-4" /> Novo artigo</button> : undefined}
      />
      <Card className="anim-fade-up mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar artigos… (ex.: wi-fi, senha, vpn)" className={`${inputCls} w-72 pl-9`} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCat("todas")} className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold transition ${cat === "todas" ? "bg-pine-900 text-paper" : "bg-paper text-ink-soft hover:bg-line/70"}`}>Todas</button>
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)}
              className={`rounded-full px-3 py-1.5 text-[11.5px] font-bold transition ${cat === c.id ? "text-white" : "bg-paper text-ink-soft hover:bg-line/70"}`}
              style={cat === c.id ? { background: c.hue } : undefined}>
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </Card>
      <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((a) => {
          const c = catById(a.catId);
          return (
            <button key={a.id} onClick={() => setOpen(a)} className="group rounded-xl border border-line bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
              <div className="flex items-center justify-between">
                {c && <CatChip cat={c} />}
                <span className="flex items-center gap-1 font-mono text-[10.5px] text-ink-faint"><Eye className="size-3.5" /> {a.views.toLocaleString("pt-BR")}</span>
              </div>
              <p className="mt-3 font-display text-[15px] leading-snug font-bold text-ink group-hover:text-brand-700">{a.title}</p>
              <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">{a.summary}</p>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-[11px] text-ink-faint">{a.author} · v{a.version}</span>
                <span className="font-mono text-[10.5px] text-ink-faint">{fmtD(a.updatedAt)}</span>
              </div>
            </button>
          );
        })}
      </div>
      {list.length === 0 && <Empty title="Nenhum artigo encontrado" sub="Tente outra palavra-chave ou categoria." />}

      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""} wide>
        {open && (
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {catById(open.catId) && <CatChip cat={catById(open.catId)!} />}
              <span className="rounded-full bg-paper px-2.5 py-1 font-mono text-[10.5px] font-semibold text-ink-soft">versão {open.version}</span>
              <span className="ml-auto text-[11.5px] text-ink-faint">{open.views.toLocaleString("pt-BR")} visualizações</span>
            </div>
            <div className="prose-sm mt-4 space-y-3">
              {open.body.map((p, i) => <p key={i} className="text-[13.5px] leading-relaxed text-ink">{p}</p>)}
            </div>
            {open.steps && (
              <div className="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
                <p className="text-[11px] font-bold tracking-widest text-brand-700 uppercase">Passo a passo</p>
                <ol className="mt-2.5 space-y-2">
                  {open.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[13px] text-ink">
                      <span className="grid size-5.5 shrink-0 place-items-center rounded-full bg-brand-600 font-mono text-[10.5px] font-bold text-white">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {open.keywords.map((k) => <span key={k} className="rounded-md bg-paper px-2 py-1 font-mono text-[10.5px] text-ink-soft">#{k}</span>)}
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[11.5px] text-ink-faint">Autor: {open.author} · atualizado em {fmtD(open.updatedAt)}</p>
          </div>
        )}
      </Modal>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Novo artigo" wide>
        <div className="space-y-3">
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink-soft uppercase">Título</span>
            <input value={nTitle} onChange={(e) => setNTitle(e.target.value)} className={inputCls} placeholder="Ex.: Como liberar espaço no OneDrive" autoFocus /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink-soft uppercase">Categoria</span>
              <select value={nCat} onChange={(e) => setNCat(e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></label>
            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink-soft uppercase">Palavras-chave (vírgula)</span>
              <input value={nKeys} onChange={(e) => setNKeys(e.target.value)} className={inputCls} placeholder="onedrive, espaço, armazenamento" /></label>
          </div>
          <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink-soft uppercase">Conteúdo (uma linha por parágrafo)</span>
            <textarea value={nBody} onChange={(e) => setNBody(e.target.value)} rows={6} className={`${inputCls} resize-none`} placeholder="Descreva a solução…" /></label>
          <div className="flex justify-end gap-2">
            <button onClick={() => setNewOpen(false)} className={btnGhost}>Cancelar</button>
            <button onClick={publish} disabled={nTitle.trim().length < 5 || nBody.trim().length < 10} className={btnPrimary}><BookOpen className="size-4" /> Publicar artigo</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Relatórios ───────────────────────────────────────────────
type ReportKey = "periodo" | "unidade" | "tecnico" | "sla" | "satisfacao" | "recorrentes";
const REPORTS: { key: ReportKey; name: string; desc: string }[] = [
  { key: "periodo", name: "Chamados por período", desc: "Volume diário de abertura e encerramento" },
  { key: "unidade", name: "Chamados por unidade", desc: "Distribuição entre as unidades" },
  { key: "tecnico", name: "Produtividade por técnico", desc: "Volume, CSAT e tempo médio" },
  { key: "sla", name: "SLA", desc: "Cumprimento por prioridade" },
  { key: "satisfacao", name: "Satisfação (CSAT)", desc: "Avaliações registradas" },
  { key: "recorrentes", name: "Chamados recorrentes", desc: "Serviços com reincidência" },
];

export function ReportsPage() {
  const { tickets, toast, logAudit } = useApp();
  const [rep, setRep] = useState<ReportKey>("periodo");

  const rows = useMemo((): { head: string[]; data: string[][] } => {
    if (rep === "periodo") {
      return {
        head: ["Data", "Abertos", "Encerrados"],
        data: ["Hoje", "Ontem", "Anteontem"].map((d, i) => [d, String(14 - i * 3), String(12 - i * 2)]),
      };
    }
    if (rep === "unidade") {
      return {
        head: ["Unidade", "Chamados", "% do total"],
        data: UNITS.map((u) => {
          const c = tickets.filter((t) => t.unitId === u.id).length;
          return [u.name, String(c), `${Math.round((c / tickets.length) * 100)}%`];
        }),
      };
    }
    if (rep === "tecnico") {
      return {
        head: ["Técnico", "Atribuídos", "CSAT"],
        data: ["p3", "p4", "p5", "p6", "p7", "p8"].map((id) => {
          const ts = tickets.filter((t) => t.techId === id);
          const rated = ts.filter((t) => t.rating);
          const csat = rated.length ? (rated.reduce((s, t) => s + (t.rating?.stars ?? 0), 0) / rated.length).toFixed(1) : "—";
          return [userById(id)?.name ?? id, String(ts.length), csat];
        }),
      };
    }
    if (rep === "sla") {
      return {
        head: ["Prioridade", "Dentro", "Vencidos", "% cumprimento"],
        data: (["P1", "P2", "P3", "P4"] as const).map((p) => [p, String(52 - p.charCodeAt(1) * 0), String((p.charCodeAt(1) - 48)), `${97 - (p.charCodeAt(1) - 49) * 3}%`]),
      };
    }
    if (rep === "satisfacao") {
      const rated = tickets.filter((t) => t.rating);
      return {
        head: ["Chamado", "Solicitante", "Nota", "Comentário"],
        data: rated.slice(0, 8).map((t) => [t.code, userById(t.requesterId)?.name ?? "—", `${t.rating?.stars}/5`, t.rating?.comment ?? "—"]),
      };
    }
    const m = new Map<string, number>();
    tickets.forEach((t) => {
      const name = `${t.catId}`;
      m.set(name, (m.get(name) ?? 0) + 1);
    });
    return {
      head: ["Categoria", "Ocorrências", "Sugestão"],
      data: [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c, v]) => [catById(c)?.name ?? c, String(v), v >= 4 ? "Publicar artigo preventivo" : "Monitorar"]),
    };
  }, [rep, tickets]);

  const exportCsv = () => {
    const csv = [rows.head.join(";"), ...rows.data.map((r) => r.join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nimbusdesk-${rep}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logAudit("Exportou relatório", REPORTS.find((r) => r.key === rep)?.name ?? rep, "—", "CSV");
    toast("Relatório CSV exportado", "ok");
  };

  return (
    <div>
      <PageHead title="Relatórios" sub="Geração em tela, Excel/CSV e PDF com trilha de auditoria" />
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit overflow-hidden">
          {REPORTS.map((r) => (
            <button key={r.key} onClick={() => setRep(r.key)}
              className={`block w-full border-b border-line px-4 py-3.5 text-left transition last:border-0 ${rep === r.key ? "bg-brand-50" : "hover:bg-paper"}`}>
              <p className={`text-[13px] font-bold ${rep === r.key ? "text-brand-700" : "text-ink"}`}>{r.name}</p>
              <p className="text-[11px] text-ink-faint">{r.desc}</p>
            </button>
          ))}
        </Card>
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
            <div>
              <p className="font-display text-[15px] font-bold text-ink">{REPORTS.find((r) => r.key === rep)?.name}</p>
              <p className="text-[11.5px] text-ink-faint">Gerado em {fmtDT(Date.now())} · dados do período atual</p>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCsv} className={btnGhost}><FileSpreadsheet className="size-4" /> CSV / Excel</button>
              <button onClick={() => { logAudit("Imprimiu relatório", REPORTS.find((r) => r.key === rep)?.name ?? rep, "—", "PDF"); window.print(); }} className={btnGhost}><Printer className="size-4" /> PDF</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left">
              <thead>
                <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-widest text-ink-faint uppercase">
                  {rows.head.map((h) => <th key={h} className="px-5 py-2.5">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.data.map((r, i) => (
                  <tr key={i} className="border-b border-line text-[12.5px] last:border-0 hover:bg-paper/60">
                    {r.map((c, j) => <td key={j} className={`px-5 py-3 ${j === 0 ? "font-semibold text-ink" : "font-mono text-[12px] text-ink-soft"}`}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Auditoria ────────────────────────────────────────────────
export function AuditPage() {
  const { audit } = useApp();
  const [q, setQ] = useState("");
  const list = audit.filter((a) => {
    const t = q.trim().toLowerCase();
    return !t || [a.user, a.op, a.entity, a.before, a.after].some((s) => s.toLowerCase().includes(t));
  });

  return (
    <div>
      <PageHead title="Trilha de Auditoria" sub="Toda ação administrativa é registrada — nada é alterado silenciosamente" />
      <Card className="anim-fade-up mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Usuário, operação, registro…" className={`${inputCls} w-72 pl-9`} />
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-ink-faint"><History className="size-3.5" /> {list.length} registros imutáveis</span>
      </Card>
      <Card className="anim-fade-up overflow-x-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="border-b border-line bg-paper/70 text-[10.5px] font-bold tracking-widest text-ink-faint uppercase">
              <th className="px-4 py-3">Quando</th><th className="px-4 py-3">Usuário</th><th className="px-4 py-3">Operação</th><th className="px-4 py-3">Registro</th><th className="px-4 py-3">Antes → Depois</th><th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.id} className="border-b border-line text-[12.5px] transition last:border-0 hover:bg-paper/60">
                <td className="px-4 py-3"><p className="font-mono text-[11.5px] font-semibold text-ink">{fmtDT(a.at)}</p><p className="text-[10.5px] text-ink-faint">{timeAgo(a.at)}</p></td>
                <td className="px-4 py-3 font-semibold text-ink">{a.user}</td>
                <td className="px-4 py-3"><span className="rounded-md bg-pine-100 px-2 py-1 text-[11px] font-bold text-pine-700">{a.op}</span></td>
                <td className="px-4 py-3 font-mono text-[11.5px] text-ink-soft">{a.entity}</td>
                <td className="px-4 py-3 text-[12px]"><span className="text-danger-600 line-through decoration-danger-500/50">{a.before}</span> <span className="text-ink-faint">→</span> <span className="font-semibold text-ok-600">{a.after}</span></td>
                <td className="px-4 py-3 font-mono text-[11px] text-ink-faint">{a.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Configurações ────────────────────────────────────────────
export function SettingsPage() {
  const { toast, logAudit } = useApp();
  const [toggles, setToggles] = useState({ mfa: true, sessionExp: true, lockout: true, ipAllow: false });

  const flip = (k: keyof typeof toggles, label: string) => {
    setToggles((t) => {
      const next = { ...t, [k]: !t[k] };
      logAudit("Alterou configuração de segurança", label, t[k] ? "Ativado" : "Desativado", next[k] ? "Ativado" : "Desativado");
      toast(`${label} ${next[k] ? "ativado" : "desativado"} — registrado em auditoria`, next[k] ? "ok" : "warn");
      return next;
    });
  };

  const Toggle = ({ on }: { on: boolean }) => (
    <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${on ? "bg-brand-600" : "bg-line-strong"}`}>
      <span className={`absolute size-4.5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-1"}`} />
    </span>
  );

  return (
    <div>
      <PageHead title="Configurações" sub="Parâmetros globais da Central de Serviços" />
      <div className="stagger grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Calendário & horário de atendimento" sub="Base para o cálculo de todos os SLAs" />
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="mb-1 block text-[11px] font-semibold text-ink-soft uppercase">Início</span><input defaultValue="08:00" className={`${inputCls} font-mono`} /></label>
            <label className="block"><span className="mb-1 block text-[11px] font-semibold text-ink-soft uppercase">Fim</span><input defaultValue="18:00" className={`${inputCls} font-mono`} /></label>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d, i) => (
              <span key={d} className={`rounded-lg px-3 py-1.5 text-[11.5px] font-bold ${i < 5 ? "bg-brand-100 text-brand-700" : "bg-paper text-ink-faint"}`}>{d}</span>
            ))}
          </div>
          <p className="mt-3 rounded-lg bg-paper px-3 py-2.5 text-[11.5px] text-ink-soft">
            SLA pausa automaticamente quando o chamado fica em <span className="font-bold">Aguardando usuário</span> e fora do horário comercial.
          </p>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Política de senha & sessão" sub="Segurança das contas corporativas" />
          <ul className="space-y-3">
            {([
              ["mfa", "Autenticação multifator (MFA)", "Obrigatória para técnicos e admins"],
              ["sessionExp", "Expiração de sessão", "Logout automático após 4h de inatividade"],
              ["lockout", "Bloqueio por tentativas", "Conta bloqueada após 5 tentativas inválidas"],
              ["ipAllow", "Restrição de IP administrativo", "Painel admin apenas na rede corporativa"],
            ] as [keyof typeof toggles, string, string][]).map(([k, label, desc]) => (
              <li key={k}>
                <button onClick={() => flip(k, label)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-left transition hover:border-brand-300">
                  <span>
                    <span className="block text-[13px] font-semibold text-ink">{label}</span>
                    <span className="text-[11.5px] text-ink-faint">{desc}</span>
                  </span>
                  <Toggle on={toggles[k]} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-faint"><Lock className="size-3.5" /> Senhas com mínimo de 12 caracteres, hash bcrypt e rotação em 90 dias.</p>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Integrações & notificações" sub="Canais ativos e roadmap de conectores" />
          <ul className="space-y-2.5">
            {([
              ["E-mail (SMTP)", "ativo", true],
              ["Notificações no sistema", "ativo", true],
              ["Microsoft Entra ID · SSO", "próxima fase", false],
              ["Microsoft Teams", "em homologação", false],
              ["WhatsApp Business", "planejado", false],
              ["Push notification (PWA)", "planejado", false],
            ] as [string, string, boolean][]).map(([name, st, on]) => (
              <li key={name} className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5">
                <span className="text-[13px] font-semibold text-ink">{name}</span>
                <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-bold ${on ? "bg-ok-100 text-ok-600" : "bg-paper text-ink-faint ring-1 ring-line"}`}>{st}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="relative overflow-hidden bg-pine-900 p-5">
          <div className="grid-faint absolute inset-0" />
          <div className="relative">
            <p className="flex items-center gap-2 font-display text-[15px] font-bold text-paper"><Sparkles className="size-4.5 text-amberx-500" /> Inteligência Artificial · arquitetura pronta</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-pine-100/70">
              O barramento de eventos do NimbusDesk já publica abertura, triagem e resolução — a camada de IA plugará sem mudanças de schema.
            </p>
            <ul className="mt-4 space-y-2">
              {["Classificação automática de categoria e prioridade", "Resumo executivo do chamado", "Busca semântica na base de conhecimento", "Detecção de chamados semelhantes", "Chatbot de primeiro atendimento"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[12.5px] text-pine-100/85">
                  <span className="size-1.5 rounded-full bg-amberx-500" /> {f}
                </li>
              ))}
            </ul>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amberx-500/15 px-3 py-1.5 text-[10.5px] font-bold tracking-wider text-amberx-500 uppercase ring-1 ring-amberx-500/30">
              <ToggleLeft className="size-3.5" /> prevista para a fase 9
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

