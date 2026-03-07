import "./App.css";
import { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AuthenticatedLayout from "./components/Layout/AuthenticatedLayout";
import NavBar from "./components/NavBar/NavBar";
import { useAuth } from "./context/useAuth";
import {
  CompararLotesPage,
  ConsultasInboxPage,
  ContactPage,
  DashboardPage,
  GestionComercialPage,
  HomePage,
  LoginPage,
  LotesPage,
  MiPanelUsuarioPage,
  RegisterPage,
  SettingsModulePage,
  SetupAdminPage,
} from "./routes/lazy-pages";

function App() {
  const { user, authReady } = useAuth();
  const location = useLocation();
  const authScreens = new Set(["/login", "/register", "/setup-admin"]);
  const useSidebarLayout = authReady && !!user && !authScreens.has(location.pathname);

  const routedContent = (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/lotes" element={<LotesPage />} />
      <Route path="/comparar" element={<CompararLotesPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/setup-admin" element={<SetupAdminPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mi-panel"
        element={
          <ProtectedRoute>
            <MiPanelUsuarioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gestion"
        element={
          <ProtectedRoute allowedRoles={["admin", "empleado"]}>
            <GestionComercialPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/consultas"
        element={
          <ProtectedRoute allowedRoles={["admin", "empleado"]}>
            <ConsultasInboxPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <SettingsModulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seguridad"
        element={
          <ProtectedRoute>
            <SettingsModulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/preferencias"
        element={
          <ProtectedRoute>
            <SettingsModulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marca"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SettingsModulePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor-sitio"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SettingsModulePage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );

  return (
    <div className="app-shell">
      {!useSidebarLayout ? <NavBar /> : null}
      <Suspense fallback={<div className="container py-8 text-sm text-[var(--color-text-muted)]">Cargando pagina...</div>}>
        {useSidebarLayout ? <AuthenticatedLayout>{routedContent}</AuthenticatedLayout> : routedContent}
      </Suspense>
    </div>
  );
}

export default App;
