import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, ArrowLeft, BookPlus, Check, CheckCircle2, ChevronDown, Clock,
  FileText, History, ImagePlus, Link2, Lock, MessageSquare, RotateCcw, Send,
  ShieldCheck, UserPlus, XCircle, Zap, StickyNote,
} from "lucide-react";
import { useApp } from "../store";
import {
  IMPACTS, PRIORITY_META, RESPONSE_TEMPLATES, STATUS_META, URGENCIES, assetById,
  catById, fmtDT, fmtD, fmtDur, matrixPriority, serviceById, teamById, timeAgo,
  unitById, userById,
} from "../data/data";
import type { Level, Ticket, TicketEvent, TicketStatus } from "../data/data";
import {
  Avatar, Card, CatChip, Empty, Modal, PriorityPill, SlaChip, StatusPill, Stars,
  btnGhost, btnPrimary, inputCls, useNow,
} from "../components/ui";

const TECH_STATUSES: TicketStatus[] = [
  "novo", "triagem", "atendimento", "aguardando_usuario", "aguardando_terceiro",
  "desenvolvimento", "homologacao", "cancelado",
];

export function TicketDetailPage() {
  const {
    route, nav, ticketById, user, tickets, addMessage, changeStatus, assignTicket,
    setPriority, rateTicket, reopenTicket, resolveTicket, linkRelated, patchTicket,
    addArticle, toast, articles,
  } = useApp();
  const t = ticketById(route.params?.id);
  const [tab, setTab] = useState<"chat" | "historico">("chat");
  const [msg, setMsg] = useState("");
  const [noteMode, setNoteMode] = useState(false);
  const [tpl, setTpl] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [solution, setSolution] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [rateStars, setRateStars] = useState(0);
  const [rateResolved, setRateResolved] = useState(true);
  const [rateComment, setRateComment] = useState("");
  const [prioOpen, setPrioOpen] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const now = useNow(30_000);
  void now;

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [tab, t?.messages.length]);

  const sv = t && serviceById(t.serviceId);
  const cat = t && catById(t.catId);
  const requester = t && userById(t.requesterId);
  const tech = t && userById(t.techId);
  const asset = t && assetById(t.assetId);
  const unit = t && unitById(t.unitId);
  const team = t && teamById(t.teamId);

  const isStaff = user?.role === "tecnico" || user?.role === "admin";
  const isRequester = user?.id === t?.requesterId;

  const historyOfUser = useMemo(
    () => (t ? tickets.filter((x) => x.requesterId === t.requesterId && x.id !== t.id).sort((a, b) => b.createdAt - a.createdAt) : []),
    [tickets, t],
  );
  const openCandidates = useMemo(
    () => (t ? tickets.filter((x) => x.id !== t.id && !t.relatedIds.includes(x.id) && !["encerrado", "cancelado"].includes(x.status)).slice(0, 8) : []),
    [tickets, t],
  );

  if (!t || !user) {
    return <Empty title="Chamado não encontrado" sub="Ele pode ter sido movido ou o link está incorreto." action={<button onClick={() => nav("chamados")} className={btnPrimary}>Voltar</button>} />;
  }

  const send = () => {
    const text = msg.trim();
    if (!text) return;
    if (isStaff) {
      addMessage(t.id, noteMode ? "internal" : "reply", text);
      if (!noteMode && t.status === "novo") changeStatus(t.id, "atendimento");
      if (!noteMode && !t.frAt) patchTicket(t.id, { frAt: Date.now() });
      toast(noteMode ? "Nota interna registrada" : "Mensagem enviada ao solicitante", "ok");
    } else {
      addMessage(t.id, "user", text);
      if (t.status === "aguardando_usuario") changeStatus(t.id, "atendimento");
      toast("Mensagem enviada ao técnico", "ok");
    }
    setMsg("");
  };

  const frState = t.frAt
    ? { ok: true, label: `1ª resposta em ${fmtDur(t.frAt - t.createdAt)}` }
    : t.frDue < Date.now()
      ? { ok: false, label: "1ª resposta vencida" }
      : { ok: true, label: `1ª resposta em ${fmtDur(t.frDue - Date.now())}` };

  const eventIcon = (e: TicketEvent) => {
    const map: Record<TicketEvent["kind"], [React.ReactNode, string]> = {
      create: [<Zap key="c" className="size-3.5" />, "bg-skyx-100 text-skyx-600"],
      status: [<CheckCircle2 key="s" className="size-3.5" />, "bg-brand-100 text-brand-700"],
      assign: [<UserPlus key="a" className="size-3.5" />, "bg-pine-100 text-pine-700"],
      comment: [<MessageSquare key="m" className="size-3.5" />, "bg-paper text-ink-soft"],
      priority: [<AlertTriangle key="p" className="size-3.5" />, "bg-warn-100 text-warn-600"],
      sla: [<Clock key="l" className="size-3.5" />, "bg-warn-100 text-warn-600"],
      reopen: [<RotateCcw key="r" className="size-3.5" />, "bg-amberx-100 text-amberx-600"],
      approval: [<ShieldCheck key="v" className="size-3.5" />, "bg-plum-100 text-plum-600"],
      rate: [<Check key="k" className="size-3.5" />, "bg-ok-100 text-ok-600"],
      link: [<Link2 key="i" className="size-3.5" />, "bg-paper text-ink-soft"],
      attachment: [<FileText key="f" className="size-3.5" />, "bg-paper text-ink-soft"],
    };
    return map[e.kind];
  };

  return (
    <div>
      {/* Cabeçalho */}
      <div className="anim-fade-up mb-5">
        <button onClick={() => nav(isStaff ? "fila" : "chamados")} className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-700 hover:underline">
          <ArrowLeft className="size-4" /> {isStaff ? "Voltar à fila" : "Meus chamados"}
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-brand-700">{t.code}</span>
              <StatusPill status={t.status} />
              <PriorityPill p={t.priority} />
              <SlaChip ticket={t} verbose />
              {t.parentId && <span className="rounded-full bg-danger-100 px-2 py-0.5 text-[10px] font-bold text-danger-600">INCIDENTE EM MASSA</span>}
              {t.relatedIds.length > 0 && <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-bold text-ink-soft ring-1 ring-line">{t.relatedIds.length} vinculado(s)</span>}
            </div>
            <h1 className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink sm:text-[22px]">{t.title}</h1>
            <p className="mt-1 text-[12.5px] text-ink-soft">
              Aberto {timeAgo(t.createdAt)} por <span className="font-semibold text-ink">{requester?.name}</span> · {unit?.name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isStaff && !t.techId && !["encerrado", "cancelado"].includes(t.status) && (
              <button onClick={() => { assignTicket(t.id, user.id); toast(`Você assumiu o chamado ${t.code}`, "ok"); }} className={btnPrimary}>
                <UserPlus className="size-4" /> Assumir chamado
              </button>
            )}
            {isStaff && !["resolvido", "encerrado", "cancelado"].includes(t.status) && (
              <>
                <button onClick={() => setResolveOpen(true)} className={`${btnGhost} border-ok-500/50 text-ok-600 hover:border-ok-500 hover:text-ok-600`}>
                  <CheckCircle2 className="size-4" /> Resolver
                </button>
                <button onClick={() => setPrioOpen(true)} className={btnGhost}>
                  <AlertTriangle className="size-4" /> Prioridade
                </button>
                <button onClick={() => setLinkOpen(true)} className={btnGhost}>
                  <Link2 className="size-4" /> Vincular
                </button>
              </>
            )}
            {(isRequester || isStaff) && ["resolvido", "encerrado"].includes(t.status) && (
              <button onClick={() => { reopenTicket(t.id); toast(`Chamado ${t.code} reaberto`, "warn"); }} className={btnGhost}>
                <RotateCcw className="size-4" /> Reabrir
              </button>
            )}
            {isStaff && t.status === "resolvido" && t.solution && (
              <button
                onClick={() => {
                  const sol = t.solution ?? "";
                  addArticle({
                    id: `kb-${t.id}`, title: `Solução: ${t.title}`, catId: t.catId,
                    keywords: [cat?.name.toLowerCase() ?? "solucao", sv?.service.name.toLowerCase() ?? ""],
                    summary: sol, body: [sol, `Artigo gerado a partir do chamado ${t.code}, resolvido por ${tech?.name ?? "equipe técnica"}.`],
                    author: user.name, updatedAt: Date.now(), views: 0, version: "1.0",
                  });
                  toast("Solução publicada na Base de Conhecimento", "ok");
                }}
                className={btnGhost}
              >
                <BookPlus className="size-4" /> Virar artigo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {/* Abas */}
          <div className="anim-fade-up mb-4 flex gap-1.5 rounded-xl border border-line bg-card p-1.5" style={{ animationDelay: "0.05s" }}>
            {([["chat", "Conversa", <MessageSquare key="i" className="size-4" />], ["historico", "Histórico & Anexos", <History key="i" className="size-4" />]] as const).map(([k, label, icon]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${tab === k ? "bg-pine-900 text-paper" : "text-ink-soft hover:bg-paper"}`}>
                {icon} {label}
                {k === "historico" && <span className="font-mono text-[10px] opacity-60">{t.events.length + t.attachments.length}</span>}
              </button>
            ))}
          </div>

          {tab === "chat" && (
            <Card className="anim-fade-up flex flex-col overflow-hidden">
              <div ref={threadRef} className="max-h-[520px] min-h-[320px] flex-1 space-y-4 overflow-y-auto bg-paper/60 p-4 sm:p-5">
                {t.messages.map((m) => {
                  const author = userById(m.by);
                  if (m.kind === "system")
                    return <p key={m.id} className="text-center text-[11px] text-ink-faint">{m.text}</p>;
                  if (m.kind === "internal")
                    return (
                      <div key={m.id} className="anim-fade-up note-hatch rounded-xl border border-amberx-500/40 bg-amberx-100/50 p-3.5">
                        <p className="mb-1 flex items-center gap-1.5 text-[10.5px] font-bold tracking-wider text-amberx-600 uppercase">
                          <StickyNote className="size-3.5" /> Nota interna · visível apenas à equipe
                        </p>
                        <p className="text-[13.5px] leading-relaxed text-ink">{m.text}</p>
                        <p className="mt-1.5 font-mono text-[10px] text-ink-faint">{author?.name ?? "Equipe"} · {fmtDT(m.at)}</p>
                      </div>
                    );
                  const mineMsg = m.by === user.id;
                  const fromStaff = m.kind === "reply";
                  return (
                    <div key={m.id} className={`anim-fade-up flex gap-2.5 ${fromStaff ? "flex-row-reverse" : ""}`}>
                      <Avatar name={author?.name ?? "?"} color={author?.color ?? "#888"} size={32} />
                      <div className={`max-w-[78%] ${fromStaff ? "text-right" : ""}`}>
                        <div className={`inline-block rounded-2xl px-4 py-2.5 text-left text-[13.5px] leading-relaxed shadow-sm ${
                          fromStaff ? "rounded-tr-sm bg-pine-900 text-paper" : "rounded-tl-sm border border-line bg-card text-ink"
                        }`}>
                          {m.text}
                        </div>
                        <p className="mt-1 px-1 font-mono text-[10px] text-ink-faint">
                          {author?.name ?? "Usuário"} {mineMsg && "(você)"} · {fmtDT(m.at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Composer */}
              {["encerrado", "cancelado"].includes(t.status) ? (
                <p className="border-t border-line bg-paper px-4 py-3.5 text-center text-[12px] text-ink-soft">
                  Chamado {STATUS_META[t.status].label.toLowerCase()}. {isRequester ? "Reabra o chamado para continuar a conversa." : ""}
                </p>
              ) : (
                <div className="border-t border-line bg-card p-3">
                  {isStaff && (
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <button onClick={() => setNoteMode(false)} className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${!noteMode ? "bg-pine-900 text-paper" : "bg-paper text-ink-soft hover:bg-line/60"}`}>
                        Mensagem ao usuário
                      </button>
                      <button onClick={() => setNoteMode(true)} className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${noteMode ? "bg-amberx-500 text-white" : "bg-paper text-ink-soft hover:bg-line/60"}`}>
                        <Lock className="mr-1 inline size-3" /> Nota interna
                      </button>
                      <div className="relative ml-auto">
                        <button onClick={() => setTpl((v) => !v)} className="flex items-center gap-1 rounded-full bg-paper px-3 py-1 text-[11px] font-bold text-ink-soft transition hover:text-brand-700">
                          Modelos de resposta <ChevronDown className="size-3.5" />
                        </button>
                        {tpl && (
                          <div className="anim-fade-up absolute bottom-full right-0 z-10 mb-2 w-72 rounded-xl border border-line bg-card p-1.5 shadow-pop">
                            {RESPONSE_TEMPLATES.map((r, i) => (
                              <button key={i} onClick={() => { setMsg(r); setTpl(false); setNoteMode(false); }}
                                className="block w-full rounded-lg px-3 py-2 text-left text-[12px] leading-snug text-ink transition hover:bg-paper">
                                {r.slice(0, 90)}…
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {t.status === "aguardando_usuario" && !isStaff && (
                    <p className="mb-2 rounded-lg bg-warn-100 px-3 py-2 text-[11.5px] font-semibold text-warn-600">
                      <Clock className="mr-1 inline size-3.5" /> O técnico está aguardando sua resposta — o SLA está pausado.
                    </p>
                  )}
                  <div className="flex items-end gap-2">
                    <textarea
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      rows={2}
                      placeholder={noteMode ? "Registrar nota interna para a equipe…" : isStaff ? "Responder ao solicitante…" : "Escreva sua mensagem…"}
                      className={`${inputCls} resize-none ${noteMode ? "border-amberx-500/50 bg-amberx-100/30 focus:border-amberx-500 focus:ring-amberx-100" : ""}`}
                    />
                    <button onClick={send} disabled={!msg.trim()} className={`${noteMode ? "bg-amberx-500 hover:bg-amberx-600" : "bg-brand-600 hover:bg-brand-700"} inline-flex h-[42px] shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-white shadow-sm transition active:scale-[0.97] disabled:opacity-40`}>
                      <Send className="size-4" /> <span className="hidden sm:inline">Enviar</span>
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {tab === "historico" && (
            <div className="anim-fade-up space-y-4">
              <Card className="p-5">
                <p className="mb-4 font-display text-sm font-bold text-ink">Linha do tempo</p>
                <ol className="relative ml-3 space-y-4 border-l-2 border-line pl-5">
                  {[...t.events].sort((a, b) => b.at - a.at).map((e) => {
                    const [icon, cls] = eventIcon(e);
                    return (
                      <li key={e.id} className="relative">
                        <span className={`absolute -left-[31px] grid size-6 place-items-center rounded-full ring-4 ring-paper ${cls}`}>{icon}</span>
                        <p className="text-[13px] leading-snug text-ink"><span className="font-semibold">{e.by}</span> — {e.text}</p>
                        <p className="mt-0.5 font-mono text-[10.5px] text-ink-faint">{fmtDT(e.at)}</p>
                      </li>
                    );
                  })}
                </ol>
              </Card>
              <Card className="p-5">
                <p className="mb-3 font-display text-sm font-bold text-ink">Anexos ({t.attachments.length})</p>
                {t.attachments.length === 0 && <p className="text-[12.5px] text-ink-faint">Nenhum arquivo anexado.</p>}
                <ul className="grid gap-2 sm:grid-cols-2">
                  {t.attachments.map((a, i) => (
                    <li key={i} className="flex items-center gap-3 rounded-lg border border-line bg-paper/60 px-3 py-2.5 transition hover:border-brand-400">
                      {a.kind === "img" ? <ImagePlus className="size-4.5 text-brand-600" /> : <FileText className="size-4.5 text-brand-600" />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-semibold text-ink">{a.name}</span>
                        <span className="font-mono text-[10px] text-ink-faint">{a.size}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          {/* Avaliação / resolução */}
          {isRequester && t.status === "resolvido" && !t.rating && (
            <Card className="anim-fade-up border-ok-500/40 bg-ok-100/40 p-4">
              <p className="font-display text-sm font-bold text-ink">O chamado foi resolvido! 🎉</p>
              <p className="mt-1 text-[12px] text-ink-soft">Sua avaliação gera o indicador de satisfação (CSAT) da TI.</p>
              <div className="mt-3 flex items-center gap-3">
                <Stars value={rateStars} onChange={setRateStars} size={26} />
              </div>
              <div className="mt-3 flex gap-1.5">
                <button onClick={() => setRateResolved(true)} className={`flex-1 rounded-lg px-2 py-1.5 text-[11.5px] font-bold transition ${rateResolved ? "bg-ok-500 text-white" : "bg-card text-ink-soft ring-1 ring-line"}`}>
                  Problema resolvido
                </button>
                <button onClick={() => setRateResolved(false)} className={`flex-1 rounded-lg px-2 py-1.5 text-[11.5px] font-bold transition ${!rateResolved ? "bg-danger-500 text-white" : "bg-card text-ink-soft ring-1 ring-line"}`}>
                  Não resolvido
                </button>
              </div>
              <input value={rateComment} onChange={(e) => setRateComment(e.target.value)} placeholder="Deixe um comentário (opcional)" className={`${inputCls} mt-2.5 py-2 text-[12.5px]`} />
              <button
                disabled={rateStars === 0}
                onClick={() => { rateTicket(t.id, rateStars, rateResolved, rateComment.trim() || undefined); toast("Obrigado pela sua avaliação!", "ok"); }}
                className={`${btnPrimary} mt-2.5 w-full`}
              >
                Confirmar e avaliar
              </button>
            </Card>
          )}
          {t.rating && (
            <Card className="anim-fade-up p-4">
              <p className="text-[11px] font-bold tracking-widest text-ink-faint uppercase">Avaliação do atendimento</p>
              <div className="mt-2 flex items-center gap-2.5">
                <Stars value={t.rating.stars} size={18} />
                <span className="font-display text-lg font-bold text-ink">{t.rating.stars}/5</span>
              </div>
              <p className="mt-1 text-[12px] text-ink-soft">{t.rating.resolved ? "Problema resolvido" : "Problema não resolvido"}{t.rating.comment ? ` — “${t.rating.comment}”` : ""}</p>
            </Card>
          )}

          {/* Aprovação */}
          {t.approval?.required && (
            <Card className="anim-fade-up p-4">
              <p className="text-[11px] font-bold tracking-widest text-ink-faint uppercase">Fluxo de aprovação</p>
              <div className="mt-3 space-y-0">
                {["Usuário", "Gestor", "TI", "Execução"].map((s, i) => {
                  const done =
                    (i === 0) ||
                    (i === 1 && t.approval!.state !== "pendente") ||
                    (i >= 2 && t.approval!.state === "aprovado" && !["aguardando_aprovacao"].includes(t.status));
                  const current = (i === 1 && t.approval!.state === "pendente") || (i === 2 && t.approval!.state === "aprovado" && t.status === "aguardando_aprovacao");
                  const rejected = t.approval!.state === "rejeitado" && i === 1;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <span className={`grid size-6 place-items-center rounded-full text-[10px] font-bold ${rejected ? "bg-danger-500 text-white" : done ? "bg-ok-500 text-white" : current ? "bg-warn-500 text-white" : "bg-paper text-ink-faint ring-1 ring-line"}`}>
                          {rejected ? <XCircle className="size-3.5" /> : done ? <Check className="size-3.5" /> : i + 1}
                        </span>
                        {i < 3 && <span className={`h-4 w-0.5 ${done ? "bg-ok-500" : "bg-line"}`} />}
                      </div>
                      <span className={`pb-3 text-[12.5px] font-semibold ${rejected ? "text-danger-600" : done ? "text-ok-600" : current ? "text-warn-600" : "text-ink-faint"}`}>{s}</span>
                    </div>
                  );
                })}
              </div>
              {user.role === "admin" && t.approval.state === "pendente" && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      patchTicket(t.id, { approval: { required: true, state: "aprovado", by: user.name }, status: "triagem" },
                        { id: `ev-ap-${Date.now()}`, at: Date.now(), by: user.name, kind: "approval", text: "Solicitação aprovada pelo gestor — liberada para a TI" });
                      toast("Solicitação aprovada", "ok");
                    }}
                    className={`${btnPrimary} flex-1 bg-ok-500 py-2 text-[12.5px] hover:bg-ok-600`}
                  >
                    <Check className="size-4" /> Aprovar
                  </button>
                  <button
                    onClick={() => {
                      patchTicket(t.id, { approval: { required: true, state: "rejeitado", by: user.name }, status: "cancelado" },
                        { id: `ev-rj-${Date.now()}`, at: Date.now(), by: user.name, kind: "approval", text: "Solicitação rejeitada pelo gestor" });
                      toast("Solicitação rejeitada", "danger");
                    }}
                    className="flex-1 rounded-lg border border-danger-500/50 px-3 py-2 text-[12.5px] font-semibold text-danger-600 transition hover:bg-danger-100"
                  >
                    Rejeitar
                  </button>
                </div>
              )}
              {t.approval.state === "pendente" && user.role !== "admin" && (
                <p className="mt-1 text-[11.5px] text-ink-soft">Aguardando aprovação do gestor da área.</p>
              )}
            </Card>
          )}

          {/* Detalhes */}
          <Card className="anim-fade-up overflow-hidden">
            <p className="border-b border-line px-4 py-3 font-display text-sm font-bold text-ink">Detalhes</p>
            <div className="space-y-3 p-4 text-[12.5px]">
              <div className="flex items-center gap-2.5">
                <Avatar name={requester?.name ?? "?"} color={requester?.color ?? "#888"} size={34} online={requester?.online} />
                <div>
                  <p className="font-semibold text-ink">{requester?.name}</p>
                  <p className="text-[11px] text-ink-faint">{requester?.dept} · {unit?.name}</p>
                </div>
              </div>
              <DetailRow label="Serviço" value={sv?.service.name ?? "—"} />
              <DetailRow label="Categoria" value={cat ? <CatChip cat={cat} /> : "—"} />
              <DetailRow label="Equipe" value={team?.name ?? "A definir"} />
              <DetailRow label="Técnico" value={tech?.name ?? "Não atribuído"} />
              <DetailRow label="Abertura" value={<span className="font-mono">{fmtDT(t.createdAt)}</span>} />
              <DetailRow label="Atualização" value={<span className="font-mono">{timeAgo(t.updatedAt)}</span>} />
              {asset && <DetailRow label="Ativo" value={<span className="font-mono text-brand-700">{asset.tag}</span>} />}
              {t.solution && <DetailRow label="Solução" value={t.solution} />}
            </div>
            <div className="border-t border-line bg-paper/60 px-4 py-3">
              <p className="mb-2 text-[10px] font-bold tracking-widest text-ink-faint uppercase">SLA</p>
              <div className="flex flex-wrap items-center gap-2">
                <SlaChip ticket={t} />
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] font-semibold ${frState.ok ? "bg-ok-100 text-ok-600" : "bg-danger-100 text-danger-600"}`}>
                  <Clock className="size-3.5" /> {frState.label}
                </span>
              </div>
            </div>
          </Card>

          {/* Relacionados */}
          <Card className="anim-fade-up p-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-bold text-ink">Chamados relacionados</p>
              {isStaff && !["encerrado", "cancelado"].includes(t.status) && (
                <button onClick={() => setLinkOpen(true)} className="text-[11px] font-semibold text-brand-700 hover:underline">+ vincular</button>
              )}
            </div>
            {t.relatedIds.length === 0 && <p className="mt-2 text-[12px] text-ink-faint">Nenhum vínculo. Relacione incidentes com a mesma causa raiz.</p>}
            <ul className="mt-2 space-y-1.5">
              {t.relatedIds.map((rid) => {
                const rt = tickets.find((x) => x.id === rid);
                if (!rt) return null;
                return (
                  <li key={rid}>
                    <button onClick={() => nav("chamado", { id: rt.id })} className="flex w-full items-center gap-2 rounded-lg border border-line px-3 py-2 text-left transition hover:border-brand-400 hover:bg-brand-50/50">
                      <Link2 className="size-3.5 shrink-0 text-brand-600" />
                      <span className="font-mono text-[11px] font-bold text-brand-700">{rt.code}</span>
                      <span className="truncate text-[12px] text-ink">{rt.title}</span>
                      <StatusPill status={rt.status} className="ml-auto" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Histórico do solicitante (staff) */}
          {isStaff && historyOfUser.length > 0 && (
            <Card className="anim-fade-up p-4">
              <p className="font-display text-sm font-bold text-ink">Histórico de {requester?.name.split(" ")[0]}</p>
              <p className="mt-1 text-[11.5px] text-ink-soft">{historyOfUser.length} chamado(s) anterior(es)</p>
              <ul className="mt-2 space-y-1">
                {historyOfUser.slice(0, 3).map((h) => (
                  <li key={h.id}>
                    <button onClick={() => nav("chamado", { id: h.id })} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-paper">
                      <span className="font-mono text-[10.5px] font-bold text-ink-faint">{h.code}</span>
                      <span className="truncate text-[12px] text-ink-soft">{h.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>

      {/* Modal resolver */}
      <Modal open={resolveOpen} onClose={() => setResolveOpen(false)} title={`Resolver ${t.code}`}>
        <p className="text-[13px] text-ink-soft">Descreva a solução aplicada. O solicitante será notificado e poderá avaliar o atendimento.</p>
        <textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={4} placeholder="Ex.: Certificado renovado via SCCM e conexão validada com o usuário…" className={`${inputCls} mt-3 resize-none`} autoFocus />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setResolveOpen(false)} className={btnGhost}>Cancelar</button>
          <button
            disabled={solution.trim().length < 5}
            onClick={() => { resolveTicket(t.id, solution.trim()); setResolveOpen(false); toast(`${t.code} resolvido — solicitante notificado`, "ok"); }}
            className={`${btnPrimary} bg-ok-500 hover:bg-ok-600`}
          >
            <CheckCircle2 className="size-4" /> Marcar como resolvido
          </button>
        </div>
      </Modal>

      {/* Modal prioridade */}
      <Modal open={prioOpen} onClose={() => setPrioOpen(false)} title="Recalcular prioridade (Impacto × Urgência)">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-soft uppercase">Impacto</span>
            <select value={t.impact} onChange={(e) => setPriority(t.id, Number(e.target.value) as Level, t.urgency)} className={inputCls}>
              {([1, 2, 3, 4] as Level[]).map((i) => <option key={i} value={i}>{IMPACTS[i]}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-ink-soft uppercase">Urgência</span>
            <select value={t.urgency} onChange={(e) => setPriority(t.id, t.impact, Number(e.target.value) as Level)} className={inputCls}>
              {([1, 2, 3, 4] as Level[]).map((i) => <option key={i} value={i}>{URGENCIES[i]}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-paper px-4 py-3">
          <span className="text-[13px] font-semibold text-ink-soft">Resultado da matriz:</span>
          <PriorityPill p={matrixPriority(t.impact, t.urgency)} />
        </div>
        <p className="mt-3 text-[11.5px] text-ink-faint">A alteração fica registrada no histórico e recalcula as metas de SLA exibidas.</p>
      </Modal>

      {/* Modal vincular */}
      <Modal open={linkOpen} onClose={() => setLinkOpen(false)} title="Vincular chamado relacionado">
        <p className="mb-3 text-[13px] text-ink-soft">Conecte incidentes com a mesma causa raiz ou dependência.</p>
        <ul className="max-h-72 space-y-1.5 overflow-y-auto">
          {openCandidates.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => { linkRelated(t.id, c.id); setLinkOpen(false); toast(`${c.code} vinculado a ${t.code}`, "ok"); }}
                className="flex w-full items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-left transition hover:border-brand-400 hover:bg-brand-50/50"
              >
                <span className="font-mono text-[11px] font-bold text-brand-700">{c.code}</span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{c.title}</span>
                <StatusPill status={c.status} />
              </button>
            </li>
          ))}
          {openCandidates.length === 0 && <p className="py-6 text-center text-xs text-ink-faint">Nenhum chamado disponível para vínculo.</p>}
        </ul>
      </Modal>

      {/* Atribuição rápida */}
      {isStaff && !["encerrado", "cancelado"].includes(t.status) && (
        <div className="anim-fade-up mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card px-4 py-3">
          <UserPlus className="size-4 text-ink-faint" />
          <span className="text-[12.5px] font-semibold text-ink-soft">Transferir / atribuir:</span>
          <select
            value={t.techId ?? ""}
            onChange={(e) => { if (e.target.value) { assignTicket(t.id, e.target.value); toast(`Chamado atribuído a ${userById(e.target.value)?.name}`, "ok"); } }}
            className="rounded-lg border border-line-strong bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand-500"
          >
            <option value="">— selecionar técnico —</option>
            {["p3", "p4", "p5", "p6", "p7", "p8"].map((id) => {
              const u = userById(id);
              return u ? <option key={id} value={id}>{u.name} · {teamById(u.teamId)?.name ?? ""}</option> : null;
            })}
          </select>
          <select
            value={t.status}
            onChange={(e) => { changeStatus(t.id, e.target.value as TicketStatus); toast(`Status alterado para ${STATUS_META[e.target.value as TicketStatus].label}`, "info"); }}
            className="rounded-lg border border-line-strong bg-white px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand-500"
          >
            {TECH_STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
          {t.reopenCount > 0 && <span className="ml-auto rounded-full bg-amberx-100 px-2 py-0.5 text-[10.5px] font-bold text-amberx-600">{t.reopenCount} reabertura(s)</span>}
        </div>
      )}
      <p className="mt-3 text-center font-mono text-[10px] text-ink-faint">
        {PRIORITY_META[t.priority].label} · criado em {fmtD(t.createdAt)} · todos os eventos são auditados
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 font-semibold text-ink-soft">{label}</span>
      <span className="text-right font-medium text-ink">{value}</span>
    </div>
  );
}
