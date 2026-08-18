import { useState } from "react";
import { ArrowRight, Fingerprint, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { USERS } from "../data/data";
import { useApp } from "../store";
import { Avatar, Logo, btnPrimary } from "../components/ui";
import { ToastHost } from "../components/shell";

const DEMO = [
  { id: "p1", roleLabel: "Portal do Usuário", desc: "Abre chamados, acompanha e avalia" },
  { id: "p3", roleLabel: "Técnico de Suporte", desc: "Fila de atendimento e produtividade" },
  { id: "p2", roleLabel: "Administração", desc: "Dashboards, gestão e auditoria" },
];

const TICKER = [
  "247 chamados no mês", "93% de SLA cumprido", "4,7/5 de satisfação", "2h18 tempo médio de resolução",
  "4 unidades conectadas", "6 equipes especializadas", "38 artigos na base", "0 incidentes críticos pendentes",
];

export function LoginPage() {
  const { login, toast } = useApp();
  const [selected, setSelected] = useState<string>("p1");
  const [pwd, setPwd] = useState("");

  const enter = () => {
    const u = USERS.find((x) => x.id === selected);
    login(selected);
    toast(`Bem-vindo(a), ${u?.name.split(" ")[0]}! Sessão segura iniciada.`, "ok");
  };

  return (
    <div className="flex min-h-screen">
      <ToastHost />
      {/* Painel institucional */}
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-pine-900 p-10 lg:flex">
        <div className="grid-faint absolute inset-0" />
        <svg className="absolute -bottom-24 -right-24 size-[560px] opacity-[0.13]" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="98" stroke="#2AA294" strokeWidth="0.8" />
          <circle cx="100" cy="100" r="72" stroke="#2AA294" strokeWidth="0.8" strokeDasharray="4 6" />
          <circle cx="100" cy="100" r="46" stroke="#2AA294" strokeWidth="0.8" />
          <path d="M20 130h34l12-28 24 52 16-34 14 18h60" stroke="#E0A03A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="relative">
          <Logo dark />
        </div>

        <div className="relative max-w-md">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-3 py-1.5 text-[11px] font-semibold tracking-wider text-brand-200 uppercase ring-1 ring-brand-500/30">
            <Sparkles className="size-3.5" /> Vetra Group · TI Corporativa
          </p>
          <h1 className="font-display text-[42px] leading-[1.05] font-bold tracking-tight text-paper">
            A central digital de <span className="text-brand-400">serviços de TI</span> da sua operação.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-pine-100/70">
            Registro, atendimento, SLA, ativos e conhecimento em um só lugar —
            simples para o usuário, produtivo para o técnico, visível para a gestão.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: <ShieldCheck className="size-4" />, text: "RBAC, trilha de auditoria e política de senha" },
              { icon: <Fingerprint className="size-4" />, text: "Pronto para SSO com Microsoft Entra ID" },
              { icon: <Sparkles className="size-4" />, text: "Arquitetura preparada para IA generativa" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 text-[13px] text-pine-100/80">
                <span className="grid size-7 place-items-center rounded-lg bg-white/5 text-brand-300 ring-1 ring-white/10">{f.icon}</span>
                {f.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] py-3">
            <div className="flex w-max animate-[ticker-x_26s_linear_infinite] gap-10 whitespace-nowrap px-5">
              {[...TICKER, ...TICKER].map((t, i) => (
                <span key={i} className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-pine-100/70">
                  <span className="size-1.5 rounded-full bg-brand-400" /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Formulário */}
      <main className="flex flex-1 items-center justify-center bg-paper px-5 py-10">
        <div className="anim-fade-up w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h2 className="font-display text-[26px] font-bold tracking-tight text-ink">Acessar o NimbusDesk</h2>
          <p className="mt-1 text-sm text-ink-soft">Escolha um perfil de demonstração para explorar o sistema.</p>

          <div className="mt-6 space-y-2.5">
            {DEMO.map((d) => {
              const u = USERS.find((x) => x.id === d.id);
              if (!u) return null;
              const active = selected === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelected(d.id)}
                  className={`flex w-full items-center gap-3.5 rounded-xl border-2 bg-card p-3.5 text-left transition-all duration-200 ${
                    active ? "border-brand-500 shadow-lift" : "border-line hover:border-brand-200 hover:shadow-sm"
                  }`}
                >
                  <Avatar name={u.name} color={u.color} size={42} online />
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{u.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${active ? "bg-brand-100 text-brand-700" : "bg-paper text-ink-faint"}`}>
                        {d.roleLabel}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[12px] text-ink-soft">{d.desc}</span>
                  </span>
                  <span className={`grid size-5 place-items-center rounded-full border-2 transition ${active ? "border-brand-500 bg-brand-500" : "border-line-strong"}`}>
                    {active && <span className="size-1.5 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && enter()}
                placeholder="Senha corporativa (demo: qualquer valor)"
                className="w-full rounded-xl border border-line-strong bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
            </div>
            <button onClick={enter} className={`${btnPrimary} mt-4 w-full rounded-xl py-3.5 text-[15px]`}>
              Entrar no sistema <ArrowRight className="size-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-line-strong bg-card/60 px-4 py-3">
            <svg viewBox="0 0 21 21" className="size-5 shrink-0">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" /><rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" /><rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            <p className="text-[12px] leading-snug text-ink-soft">
              <span className="font-semibold text-ink">Entrar com Microsoft Entra ID</span> — single sign-on disponível na próxima fase do projeto.
            </p>
          </div>

          <p className="mt-6 text-center text-[11px] text-ink-faint">
            Sessão com expiração automática · comunicações criptografadas · ações registradas em auditoria
          </p>
        </div>
      </main>
    </div>
  );
}
