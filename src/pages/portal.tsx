import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Camera, Check, ChevronRight, Clock3, FileText,
  ImagePlus, Inbox, Paperclip, PlusCircle, Search, Send, ShieldCheck, Sparkles, X,
} from "lucide-react";
import { useApp } from "../store";
import {
  ASSETS, CATEGORIES, IMPACTS, URGENCIES, catById, fmtDT, matrixPriority, serviceById,
  timeAgo, unitById, ALL_SERVICES,
} from "../data/data";
import type { Attachment, Level, Ticket } from "../data/data";
import {
  Card, CatChip, CatIcon, Empty, PriorityPill, SectionTitle, SlaChip,
  StatusPill, Stars, btnGhost, btnPrimary, inputCls,
} from "../components/ui";
import { PageHead } from "../components/shell";

// ── Linha de chamado reutilizável ────────────────────────────
export function TicketRow({ t, highlight }: { t: Ticket; highlight?: boolean }) {
  const { nav } = useApp();
  const sv = serviceById(t.serviceId);
  const cat = catById(t.catId);
  return (
    <button
      onClick={() => nav("chamado", { id: t.id })}
      className={`group flex w-full items-center gap-3.5 border-b border-line px-4 py-3.5 text-left transition last:border-0 hover:bg-brand-50/60 ${highlight ? "bg-warn-100/40" : ""}`}
    >
      {cat && (
        <span className="hidden size-9 shrink-0 place-items-center rounded-lg sm:grid" style={{ background: `${cat.hue}14`, color: cat.hue }}>
          <CatIcon catId={cat.id} className="size-4.5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-brand-700">{t.code}</span>
          <StatusPill status={t.status} />
          {t.priority === "P1" && <PriorityPill p={t.priority} short />}
        </span>
        <span className="mt-0.5 block truncate text-[13.5px] font-semibold text-ink">{t.title}</span>
        <span className="mt-0.5 block text-[11px] text-ink-faint">
          {sv?.service.name} · atualizado {timeAgo(t.updatedAt)}
        </span>
      </span>
      <span className="hidden flex-col items-end gap-1.5 sm:flex">
        <SlaChip ticket={t} />
        <span className="text-[11px] text-ink-faint">{fmtDT(t.createdAt)}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </button>
  );
}

// ── Início do portal ─────────────────────────────────────────
export function UserHome() {
  const { user, nav, tickets, articles, setPrefill } = useApp();
  const [q, setQ] = useState("");
  const [showSug, setShowSug] = useState(false);

  const my = useMemo(
    () => tickets.filter((t) => t.requesterId === user?.id).sort((a, b) => b.updatedAt - a.updatedAt),
    [tickets, user],
  );
  const openCount = my.filter((t) => !["encerrado", "cancelado"].includes(t.status)).length;
  const waitingMe = my.filter((t) => t.status === "aguardando_usuario").length;

  const term = q.trim().toLowerCase();
  const sugServices = term.length >= 2
    ? ALL_SERVICES.filter(({ service, cat }) =>
        service.name.toLowerCase().includes(term) || cat.name.toLowerCase().includes(term) || service.desc.toLowerCase().includes(term),
      ).slice(0, 4)
    : [];
  const sugArticles = term.length >= 2
    ? articles.filter((a) => a.title.toLowerCase().includes(term) || a.keywords.some((k) => term.includes(k) || k.includes(term))).slice(0, 3)
    : [];

  const goService = (serviceId: string) => {
    setPrefill({ serviceId });
    nav("novo");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        {/* Abertura característica do produto */}
        <div className="anim-fade-up relative overflow-hidden rounded-2xl bg-pine-900 p-6 sm:p-9">
          <div className="grid-faint absolute inset-0" />
          <svg className="absolute -right-10 -top-16 size-72 opacity-15" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="96" stroke="#2AA294" strokeWidth="1" />
            <circle cx="100" cy="100" r="64" stroke="#2AA294" strokeWidth="1" strokeDasharray="3 7" />
            <path d="M30 120h30l10-22 20 44 14-28 12 14h54" stroke="#E0A03A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="relative">
            <p className="font-mono text-[11px] tracking-[0.2em] text-brand-300 uppercase">Central de Serviços · Vetra</p>
            <h1 className="mt-2 font-display text-[26px] leading-tight font-bold tracking-tight text-paper sm:text-4xl">
              Olá, {user?.name.split(" ")[0]}. <span className="text-brand-300">Como podemos ajudar?</span>
            </h1>
            <div className="relative mt-5 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-faint" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setShowSug(true); }}
                onFocus={() => setShowSug(true)}
                onKeyDown={(e) => e.key === "Enter" && sugArticles.length > 0 && nav("kb")}
                placeholder="Pesquise um serviço ou descreva o seu problema…"
                className="w-full rounded-xl border-0 bg-card py-4 pl-12 pr-4 text-[15px] text-ink shadow-pop outline-none ring-2 ring-transparent transition placeholder:text-ink-faint focus:ring-brand-400"
              />
              {showSug && term.length >= 2 && (
                <div className="anim-fade-up absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-xl border border-line bg-card text-left shadow-pop">
                  {sugServices.map(({ service, cat }) => (
                    <button key={service.id} onClick={() => goService(service.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-paper">
                      <span className="grid size-8 place-items-center rounded-lg" style={{ background: `${cat.hue}14`, color: cat.hue }}>
                        <CatIcon catId={cat.id} className="size-4" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[13px] font-semibold text-ink">{service.name}</span>
                        <span className="block text-[11px] text-ink-faint">{cat.name}</span>
                      </span>
                      <PlusCircle className="size-4 text-brand-600" />
                    </button>
                  ))}
                  {sugArticles.length > 0 && (
                    <div className="border-t border-line bg-brand-50/50 px-4 py-2">
                      <p className="flex items-center gap-1.5 text-[11px] font-bold text-brand-700">
                        <Sparkles className="size-3.5" /> Talvez estes artigos resolvam seu problema
                      </p>
                    </div>
                  )}
                  {sugArticles.map((a) => (
                    <button key={a.id} onClick={() => nav("kb")} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-paper">
                      <BookOpen className="size-4 shrink-0 text-brand-600" />
                      <span className="truncate text-[13px] text-ink">{a.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button onClick={() => nav("novo")} className={`${btnPrimary} rounded-xl`}>
                <PlusCircle className="size-4" /> Abrir solicitação
              </button>
              <button onClick={() => nav("chamados")} className={`${btnGhost} rounded-xl border-white/20 bg-white/5 text-paper hover:border-brand-400 hover:text-brand-200`}>
                <Inbox className="size-4" /> Meus chamados {openCount > 0 && <span className="rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">{openCount}</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Catálogo em destaque */}
        <div className="mt-8">
          <SectionTitle title="Principais serviços" sub="Toque em uma categoria para ver todos os serviços disponíveis" />
          <div className="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-3">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => nav("catalogo", { cat: c.id })}
                className="group relative overflow-hidden rounded-xl border border-line bg-card p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lift"
              >
                <span className="absolute inset-x-0 top-0 h-0.5 transition-all duration-300 group-hover:h-1" style={{ background: c.hue }} />
                <span className="grid size-10 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: `${c.hue}14`, color: c.hue }}>
                  <CatIcon catId={c.id} />
                </span>
                <span className="mt-3 block font-display text-[13.5px] leading-tight font-semibold text-ink">{c.name}</span>
                <span className="mt-1 block text-[11px] text-ink-faint">{c.services.length} serviços</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coluna lateral viva */}
      <div className="space-y-4">
        {waitingMe > 0 && (
          <button onClick={() => nav("chamados", { tab: "aguardando" })} className="anim-fade-up flex w-full items-center gap-3 rounded-xl border border-warn-500/40 bg-warn-100 p-4 text-left transition hover:shadow-lift">
            <span className="relative grid size-9 place-items-center rounded-full bg-warn-500 text-white">
              <Clock3 className="size-4.5" />
              <span className="absolute inset-0 rounded-full bg-warn-500" style={{ animation: "ping-soft 1.8s cubic-bezier(0,0,0.2,1) infinite" }} />
            </span>
            <span>
              <span className="block text-sm font-bold text-ink">O técnico precisa de você</span>
              <span className="block text-[12px] text-ink-soft">{waitingMe} chamado(s) aguardando sua resposta</span>
            </span>
            <ChevronRight className="ml-auto size-4 text-warn-600" />
          </button>
        )}

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-sm font-semibold text-ink">Atividade recente</p>
            <button onClick={() => nav("chamados")} className="text-[11px] font-semibold text-brand-700 hover:underline">ver todos</button>
          </div>
          {my.slice(0, 4).map((t) => (
            <TicketRow key={t.id} t={t} highlight={t.status === "aguardando_usuario"} />
          ))}
          {my.length === 0 && <p className="px-4 py-8 text-center text-xs text-ink-faint">Você ainda não abriu chamados.</p>}
        </Card>

        <Card className="p-4">
          <p className="font-display text-sm font-semibold text-ink">Seu ambiente</p>
          <div className="mt-3 space-y-2.5 text-[12.5px]">
            <div className="flex justify-between"><span className="text-ink-soft">Unidade</span><span className="font-semibold text-ink">{unitById(user?.unitId)?.name}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Setor</span><span className="font-semibold text-ink">{user?.dept}</span></div>
            <div className="flex justify-between"><span className="text-ink-soft">Chamados ativos</span><span className="font-mono font-semibold text-brand-700">{openCount}</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Catálogo ─────────────────────────────────────────────────
export function CatalogPage() {
  const { nav, route, setPrefill } = useApp();
  const [q, setQ] = useState("");
  const activeCat = route.params?.cat;
  const term = q.trim().toLowerCase();

  const cats = CATEGORIES.filter((c) => !activeCat || c.id === activeCat).map((c) => ({
    ...c,
    services: c.services.filter((s) => !term || s.name.toLowerCase().includes(term) || s.desc.toLowerCase().includes(term)),
  })).filter((c) => c.services.length > 0);

  return (
    <div>
      <PageHead
        title="Catálogo de Serviços"
        sub="Serviços disponíveis para solicitação, com SLA e equipe responsável definidos"
        right={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar serviços…" className={`${inputCls} w-56 pl-9`} />
          </div>
        }
      />
      {activeCat && (
        <button onClick={() => nav("catalogo")} className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 hover:underline">
          <ArrowLeft className="size-4" /> Ver todas as categorias
        </button>
      )}
      <div className="stagger space-y-5">
        {cats.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5" style={{ boxShadow: `inset 3px 0 0 ${c.hue}` }}>
              <span className="grid size-9 place-items-center rounded-lg" style={{ background: `${c.hue}14`, color: c.hue }}>
                <CatIcon catId={c.id} className="size-4.5" />
              </span>
              <div>
                <p className="font-display text-[15px] font-bold text-ink">{c.name}</p>
                <p className="text-[11.5px] text-ink-soft">{c.desc}</p>
              </div>
            </div>
            <ul>
              {c.services.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => { setPrefill({ serviceId: s.id }); nav("novo"); }}
                    className="group flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition last:border-0 hover:bg-brand-50/60"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-ink">
                        {s.name}
                        {s.approval && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-plum-100 px-2 py-0.5 text-[10px] font-bold text-plum-600">
                            <ShieldCheck className="size-3" /> exige aprovação
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-ink-soft">{s.desc}</span>
                    </span>
                    <span className="hidden shrink-0 text-right sm:block">
                      <span className="block font-mono text-[11px] font-semibold text-ink-soft">SLA {s.resH}h</span>
                      <span className="block text-[10.5px] text-ink-faint">1ª resposta {s.frH}h</span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-brand-600" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
        {cats.length === 0 && <Empty title="Nenhum serviço encontrado" sub={`Nada corresponde a “${q}”. Tente outro termo.`} />}
      </div>
    </div>
  );
}

// ── Novo chamado (wizard) ────────────────────────────────────
const STEPS = ["Serviço", "Detalhes", "Prioridade", "Revisão"];

export function NewTicketPage() {
  const { user, nav, createTicket, toast, articles, prefill, setPrefill } = useApp();
  const [step, setStep] = useState(prefill.serviceId ? 1 : 0);
  const [serviceId, setServiceId] = useState(prefill.serviceId);
  const [sq, setSq] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [unitId, setUnitId] = useState(user?.unitId ?? "u1");
  const [assetId, setAssetId] = useState<string>(prefill.assetId ?? "");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [impact, setImpact] = useState<Level>(2);
  const [urgency, setUrgency] = useState<Level>(2);

  const sv = serviceById(serviceId);
  const cat = catById(sv?.cat.id);
  const priority = matrixPriority(impact, urgency);

  const term = sq.trim().toLowerCase();
  const serviceList = ALL_SERVICES.filter(({ service, cat: c }) =>
    !term || service.name.toLowerCase().includes(term) || c.name.toLowerCase().includes(term),
  );

  const textTokens = `${title} ${desc}`.toLowerCase();
  const kbSug = articles
    .filter((a) => a.keywords.some((k) => textTokens.includes(k)))
    .slice(0, 3);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const next: Attachment[] = Array.from(list).map((f) => ({
      name: f.name,
      size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
      kind: f.type.startsWith("image/") ? "img" : f.name.endsWith(".pdf") ? "pdf" : "doc",
    }));
    setFiles((old) => [...old, ...next]);
  };

  const submit = () => {
    if (!sv) return;
    const t = createTicket({
      title: title.trim() || sv.service.name,
      description: desc,
      serviceId: sv.service.id,
      catId: sv.cat.id,
      unitId,
      assetId: assetId || undefined,
      impact, urgency,
      attachments: files,
    });
    setPrefill({});
    toast(`Chamado ${t.code} aberto com sucesso!`, "ok");
    nav("chamado", { id: t.id });
  };

  const canNext = step === 0 ? !!serviceId : step === 1 ? title.trim().length >= 5 && desc.trim().length >= 10 : true;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHead title="Abrir chamado" sub="Conte o que aconteceu — a equipe certa será acionada automaticamente" />

      {/* Progresso */}
      <div className="anim-fade-up mb-6 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-1.5">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[11px] font-bold transition ${
                i === step ? "bg-pine-900 text-paper" : i < step ? "bg-brand-100 text-brand-700" : "bg-card text-ink-faint ring-1 ring-line"
              }`}
            >
              <span className={`grid size-5 place-items-center rounded-full text-[10px] ${i === step ? "bg-brand-500 text-white" : i < step ? "bg-brand-600 text-white" : "bg-paper"}`}>
                {i < step ? <Check className="size-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`h-0.5 flex-1 rounded-full ${i < step ? "bg-brand-500" : "bg-line"}`} />}
          </div>
        ))}
      </div>

      {/* Etapa 1 · serviço */}
      {step === 0 && (
        <Card className="anim-fade-up p-5">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
            <input value={sq} onChange={(e) => setSq(e.target.value)} placeholder="Buscar serviço… (ex.: senha, wi-fi, impressora)" className={`${inputCls} pl-9`} autoFocus />
          </div>
          <div className="stagger grid gap-2 sm:grid-cols-2">
            {serviceList.map(({ service, cat: c }) => (
              <button
                key={service.id}
                onClick={() => setServiceId(service.id)}
                className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                  serviceId === service.id ? "border-brand-500 bg-brand-50" : "border-line hover:border-brand-200"
                }`}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg" style={{ background: `${c.hue}14`, color: c.hue }}>
                  <CatIcon catId={c.id} className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-ink">{service.name}</span>
                  <span className="block text-[10.5px] text-ink-faint">{c.name}{service.approval ? " · com aprovação" : ""}</span>
                </span>
              </button>
            ))}
          </div>
          {serviceList.length === 0 && <Empty title="Nenhum serviço encontrado" sub="Tente outro termo ou navegue pelo catálogo completo." />}
        </Card>
      )}

      {/* Etapa 2 · detalhes */}
      {step === 1 && sv && (
        <div className="anim-fade-up space-y-4">
          {kbSug.length > 0 && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
              <p className="flex items-center gap-2 text-[12px] font-bold text-brand-700">
                <Sparkles className="size-4" /> Talvez estes artigos resolvam seu problema
              </p>
              <ul className="mt-2 space-y-1">
                {kbSug.map((a) => (
                  <li key={a.id}>
                    <button onClick={() => nav("kb")} className="flex items-center gap-2 text-[13px] text-ink underline-offset-2 transition hover:text-brand-700 hover:underline">
                      <BookOpen className="size-3.5 text-brand-600" /> {a.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2 rounded-lg bg-paper px-3 py-2.5 text-[12.5px]">
              <CatChip cat={cat!} />
              <span className="font-semibold text-ink">{sv.service.name}</span>
              <button onClick={() => setStep(0)} className="ml-auto text-[11px] font-semibold text-brand-700 hover:underline">trocar</button>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">Título *</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resuma o problema em uma frase" className={inputCls} autoFocus />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">Descrição *</span>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5}
                placeholder="Descreva o que acontece, desde quando, mensagens de erro e o que você já tentou…"
                className={`${inputCls} resize-none`} />
              <span className="mt-1 block text-right font-mono text-[10px] text-ink-faint">{desc.length} caracteres</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">Unidade</span>
                <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className={inputCls}>
                  {["u1", "u2", "u3", "u4"].map((u) => {
                    const un = unitById(u);
                    return <option key={u} value={u}>{un?.name}</option>;
                  })}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">Ativo / equipamento</span>
                <select value={assetId} onChange={(e) => setAssetId(e.target.value)} className={inputCls}>
                  <option value="">Nenhum relacionado</option>
                  {ASSETS.filter((a) => a.unitId === unitId || a.userId === user?.id).map((a) => (
                    <option key={a.id} value={a.id}>{a.tag} · {a.type} {a.model}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">Anexos (arquivos e prints)</span>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line-strong bg-paper px-3 py-2 text-[12.5px] font-semibold text-ink-soft transition hover:border-brand-400 hover:text-brand-700">
                  <Paperclip className="size-4" /> Anexar arquivo
                  <input type="file" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line-strong bg-paper px-3 py-2 text-[12.5px] font-semibold text-ink-soft transition hover:border-brand-400 hover:text-brand-700 sm:hidden">
                  <Camera className="size-4" /> Tirar foto
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFiles(e.target.files)} />
                </label>
                <label className="hidden cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line-strong bg-paper px-3 py-2 text-[12.5px] font-semibold text-ink-soft transition hover:border-brand-400 hover:text-brand-700 sm:inline-flex">
                  <ImagePlus className="size-4" /> Imagem / print
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
                </label>
              </div>
              {files.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <li key={i} className="anim-pop flex items-center gap-1.5 rounded-lg bg-paper px-2.5 py-1.5 text-[11.5px] font-medium text-ink">
                      {f.kind === "img" ? <ImagePlus className="size-3.5 text-brand-600" /> : <FileText className="size-3.5 text-brand-600" />}
                      {f.name} <span className="text-ink-faint">({f.size})</span>
                      <button onClick={() => setFiles(files.filter((_, x) => x !== i))} className="text-ink-faint hover:text-danger-500" aria-label="Remover anexo">
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Etapa 3 · prioridade */}
      {step === 2 && (
        <Card className="anim-fade-up p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">Impacto</span>
              <select value={impact} onChange={(e) => setImpact(Number(e.target.value) as Level)} className={inputCls}>
                {([1, 2, 3, 4] as Level[]).map((i) => <option key={i} value={i}>{IMPACTS[i]} — {i === 1 ? "só eu" : i === 2 ? "minha equipe" : i === 3 ? "minha unidade" : "toda a empresa"}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-soft uppercase">Urgência</span>
              <select value={urgency} onChange={(e) => setUrgency(Number(e.target.value) as Level)} className={inputCls}>
                {([1, 2, 3, 4] as Level[]).map((i) => <option key={i} value={i}>{URGENCIES[i]} — {i === 1 ? "quando possível" : i === 2 ? "hoje" : i === 3 ? "nas próximas horas" : "parada total"}</option>)}
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="w-fit">
              <p className="mb-1.5 text-[10px] font-bold tracking-widest text-ink-faint uppercase">Matriz impacto × urgência</p>
              <div className="grid grid-cols-5 gap-1">
                <span />
                {([4, 3, 2, 1] as Level[]).map((u) => (
                  <span key={`h${u}`} className={`grid h-7 place-items-center rounded text-[9px] font-bold ${urgency === u ? "bg-pine-900 text-paper" : "bg-paper text-ink-faint"}`}>{URGENCIES[u].slice(0, 3)}</span>
                ))}
                {([4, 3, 2, 1] as Level[]).map((im) => (
                  <div key={`r${im}`} className="contents">
                    <span className={`grid h-9 w-10 place-items-center rounded text-[9px] font-bold ${impact === im ? "bg-pine-900 text-paper" : "bg-paper text-ink-faint"}`}>{IMPACTS[im].slice(0, 3)}</span>
                    {([1, 2, 3, 4] as Level[]).map((u) => {
                      const p = matrixPriority(im, u);
                      const active = impact === im && urgency === u;
                      const colors: Record<string, string> = { P1: "bg-danger-500", P2: "bg-amberx-500", P3: "bg-warn-500", P4: "bg-brand-500" };
                      return (
                        <button key={`${im}${u}`} onClick={() => { setImpact(im); setUrgency(u); }}
                          className={`grid h-9 place-items-center rounded font-mono text-[10px] font-bold text-white transition ${colors[p]} ${active ? "ring-2 ring-pine-900 ring-offset-2 scale-105" : "opacity-50 hover:opacity-90"}`}>
                          {p}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-paper p-4">
              <p className="text-[11px] font-bold tracking-widest text-ink-faint uppercase">Prioridade calculada</p>
              <div className="mt-1.5"><PriorityPill p={priority} /></div>
              {sv && (
                <p className="mt-2.5 text-[12px] leading-relaxed text-ink-soft">
                  SLA deste serviço: <span className="font-mono font-semibold text-ink">1ª resposta em {sv.service.frH}h</span> e{" "}
                  <span className="font-mono font-semibold text-ink">resolução em {sv.service.resH}h</span> (horário comercial).
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Etapa 4 · revisão */}
      {step === 3 && sv && (
        <Card className="anim-fade-up p-5">
          <div className="space-y-3">
            {[
              ["Serviço", `${cat?.name} · ${sv.service.name}`],
              ["Título", title],
              ["Unidade", unitById(unitId)?.name ?? "—"],
              ["Ativo", assetId ? ASSETS.find((a) => a.id === assetId)?.tag ?? "—" : "Nenhum"],
              ["Prioridade", matrixPriority(impact, urgency)],
              ["Anexos", files.length ? files.map((f) => f.name).join(", ") : "Nenhum"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-start justify-between gap-4 border-b border-line pb-3 text-[13px] last:border-0">
                <span className="font-semibold text-ink-soft">{k}</span>
                <span className="max-w-[60%] text-right font-medium text-ink">{v}</span>
              </div>
            ))}
            <p className="rounded-lg bg-paper px-3 py-2.5 text-[12px] leading-relaxed text-ink-soft">
              <Send className="mr-1 inline size-3.5 text-brand-600" />
              {sv.service.approval
                ? "Este serviço exige aprovação do gestor. O chamado iniciará como “Aguardando aprovação” e você será notificado(a) em cada etapa."
                : `Após o envio, a equipe responsável será notificada e o prazo de primeira resposta é de ${sv.service.frH}h.`}
            </p>
          </div>
        </Card>
      )}

      {/* Navegação */}
      <div className="mt-5 flex items-center justify-between">
        <button onClick={() => (step === 0 ? nav("catalogo") : setStep(step - 1))} className={btnGhost}>
          <ArrowLeft className="size-4" /> {step === 0 ? "Cancelar" : "Voltar"}
        </button>
        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} disabled={!canNext} className={btnPrimary}>
            Continuar <ArrowRight className="size-4" />
          </button>
        ) : (
          <button onClick={submit} className={`${btnPrimary} bg-ok-500 hover:bg-ok-600`}>
            <Check className="size-4" /> Abrir chamado
          </button>
        )}
      </div>
    </div>
  );
}

// ── Meus chamados ────────────────────────────────────────────
const TABS: { key: string; label: string; match: (t: Ticket) => boolean }[] = [
  { key: "abertos", label: "Em andamento", match: (t) => !["resolvido", "encerrado", "cancelado"].includes(t.status) },
  { key: "aguardando", label: "Aguardando você", match: (t) => t.status === "aguardando_usuario" },
  { key: "resolvidos", label: "Para avaliar", match: (t) => t.status === "resolvido" && !t.rating },
  { key: "encerrados", label: "Encerrados", match: (t) => ["encerrado", "cancelado"].includes(t.status) || !!t.rating },
  { key: "todos", label: "Todos", match: () => true },
];

export function MyTicketsPage() {
  const { user, tickets, nav, route } = useApp();
  const [tab, setTab] = useState(route.params?.tab ?? "abertos");
  const mine = useMemo(
    () => tickets.filter((t) => t.requesterId === user?.id).sort((a, b) => b.updatedAt - a.updatedAt),
    [tickets, user],
  );
  const current = TABS.find((t) => t.key === tab) ?? TABS[0];
  const list = mine.filter(current.match);

  return (
    <div>
      <PageHead
        title="Meus Chamados"
        sub="Acompanhe o andamento, converse com o técnico e avalie o atendimento"
        right={
          <button onClick={() => nav("novo")} className={btnPrimary}>
            <PlusCircle className="size-4" /> Novo chamado
          </button>
        }
      />
      <div className="anim-fade-up mb-4 flex gap-1.5 overflow-x-auto rounded-xl border border-line bg-card p-1.5">
        {TABS.map((t) => {
          const count = mine.filter(t.match).length;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${active ? "bg-pine-900 text-paper" : "text-ink-soft hover:bg-paper"}`}>
              {t.label}
              <span className={`rounded-full px-1.5 font-mono text-[10px] ${active ? "bg-brand-500 text-white" : "bg-paper text-ink-faint"}`}>{count}</span>
            </button>
          );
        })}
      </div>
      <Card className="anim-fade-up overflow-hidden">
        {list.map((t) => <TicketRow key={t.id} t={t} highlight={t.status === "aguardando_usuario"} />)}
        {list.length === 0 && (
          <Empty
            title={tab === "resolvidos" ? "Nada para avaliar" : "Nenhum chamado aqui"}
            sub={tab === "resolvidos" ? "Quando um chamado for resolvido, ele aparecerá aqui para sua avaliação." : "Abra um chamado e acompanhe tudo por aqui."}
            action={<button onClick={() => nav("novo")} className={btnPrimary}><PlusCircle className="size-4" /> Abrir chamado</button>}
          />
        )}
      </Card>
      {tab === "encerrados" && list.some((t) => t.rating) && (
        <p className="mt-3 text-center text-[11px] text-ink-faint">
          Sua satisfação média: <Stars value={Math.round(list.filter((t) => t.rating).reduce((s, t) => s + (t.rating?.stars ?? 0), 0) / Math.max(1, list.filter((t) => t.rating).length))} size={14} />
        </p>
      )}
    </div>
  );
}
