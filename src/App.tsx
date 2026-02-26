import "./App.css";
import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import NavBar from "./components/NavBar/NavBar";

const Home = lazy(() => import("./pages/Home"));
const Lotes = lazy(() => import("./pages/Lotes"));
const CompararLotes = lazy(() => import("./pages/CompararLotes"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const SetupAdmin = lazy(() => import("./pages/SetupAdmin"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MiPanelUsuario = lazy(() => import("./pages/MiPanelUsuario"));
const GestionComercial = lazy(() => import("./pages/GestionComercial"));
const ConsultasInbox = lazy(() => import("./pages/ConsultasInbox"));

function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <Suspense fallback={<div className="container py-8 text-sm text-[var(--color-text-muted)]">Cargando pagina...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lotes" element={<Lotes />} />
          <Route path="/comparar" element={<CompararLotes />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-admin" element={<SetupAdmin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mi-panel"
            element={
              <ProtectedRoute>
                <MiPanelUsuario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gestion"
            element={
              <ProtectedRoute allowedRoles={["admin", "empleado"]}>
                <GestionComercial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultas"
            element={
              <ProtectedRoute allowedRoles={["admin", "empleado"]}>
                <ConsultasInbox />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
