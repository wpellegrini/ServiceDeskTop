import type { ReactNode } from "react";
import type { Page } from "./store";
import { AppProvider, useApp } from "./store";
import { Shell } from "./components/shell";
import { LoginPage } from "./pages/Login";
import { CatalogPage, MyTicketsPage, NewTicketPage, UserHome } from "./pages/portal";
import { TicketDetailPage } from "./pages/ticket";
import { QueuePage, TechDashboard } from "./pages/tech";
import { AdminDashboard } from "./pages/admin";
import { CatalogAdmin, SlaAdmin, TechTeamsAdmin, UnitsAdmin, UsersAdmin } from "./pages/admin2";
import { AssetsAdmin, AuditPage, KbPage, ReportsPage, SettingsPage } from "./pages/admin3";

const USER_PAGES = new Set(["home", "catalogo", "novo", "chamados", "chamado", "kb"]);
const TECH_PAGES = new Set(["tech-dash", "fila", "chamado", "kb"]);

function Router() {
  const { user, route, nav } = useApp();

  if (!user) return <LoginPage />;

  // guarda de perfil (RBAC de navegação)
  if (user.role === "usuario" && !USER_PAGES.has(route.page)) {
    return <Shell><RedirectTo page="home" nav={nav} /></Shell>;
  }
  if (user.role === "tecnico" && !TECH_PAGES.has(route.page)) {
    return <Shell><RedirectTo page="tech-dash" nav={nav} /></Shell>;
  }

  let page: ReactNode;
  switch (route.page) {
    case "home": page = <UserHome />; break;
    case "catalogo": page = <CatalogPage />; break;
    case "novo": page = <NewTicketPage />; break;
    case "chamados": page = <MyTicketsPage />; break;
    case "chamado": page = <TicketDetailPage />; break;
    case "kb": page = <KbPage />; break;
    case "tech-dash": page = <TechDashboard />; break;
    case "fila": page = <QueuePage />; break;
    case "admin-dash": page = <AdminDashboard />; break;
    case "admin-usuarios": page = <UsersAdmin />; break;
    case "admin-tecnicos": page = <TechTeamsAdmin />; break;
    case "admin-unidades": page = <UnitsAdmin />; break;
    case "admin-catalogo": page = <CatalogAdmin />; break;
    case "admin-sla": page = <SlaAdmin />; break;
    case "admin-ativos": page = <AssetsAdmin />; break;
    case "admin-kb": page = <KbPage />; break;
    case "admin-relatorios": page = <ReportsPage />; break;
    case "admin-auditoria": page = <AuditPage />; break;
    case "admin-config": page = <SettingsPage />; break;
    default: page = <UserHome />;
  }

  return <Shell>{page}</Shell>;
}

function RedirectTo({ page, nav }: { page: Page; nav: (p: Page) => void }) {
  // navega no próximo tick para evitar setState durante render
  queueMicrotask(() => nav(page));
  return null;
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
