import "./App.css";
import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import NavBar from "./components/NavBar/NavBar";
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
  SetupAdminPage,
} from "./routes/lazy-pages";

function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <Suspense fallback={<div className="container py-8 text-sm text-[var(--color-text-muted)]">Cargando pagina...</div>}>
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
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
