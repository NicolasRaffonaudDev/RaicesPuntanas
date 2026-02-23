import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { commercialApi } from "../../services/commercialApi";
import { hasPermission } from "../../utils/permissions";

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingConsultas, setPendingConsultas] = useState(0);
  const { token, user, logout } = useAuth();

  const canManageConsultas = hasPermission(user?.role, "consultas.manage");

  const loadPendingConsultas = useCallback(async () => {
    if (!token || !canManageConsultas) {
      setPendingConsultas(0);
      return;
    }

    try {
      const count = await commercialApi.getConsultasPendientesCount(token);
      setPendingConsultas(count);
    } catch {
      setPendingConsultas(0);
    }
  }, [token, canManageConsultas]);

  useEffect(() => {
    void loadPendingConsultas();
  }, [loadPendingConsultas]);

  useEffect(() => {
    if (!canManageConsultas) return;

    const socket = io("http://localhost:3001", { transports: ["websocket"] });
    socket.on("audit:created", (entry: { action?: string }) => {
      if (entry?.action?.startsWith("consulta.")) {
        void loadPendingConsultas();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [canManageConsultas, loadPendingConsultas]);

  return (
    <nav className="border-b border-[var(--color-border)] bg-black/90 px-4 py-4 text-white backdrop-blur-sm">
      <div className="container flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-lg font-bold tracking-wide text-[var(--color-primary)]">
          Raices Puntanas
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded border border-[var(--color-primary)] px-3 py-1 md:hidden"
        >
          Menu
        </button>
        <div className={`w-full items-center gap-4 md:flex md:w-auto ${isOpen ? "flex" : "hidden"}`}>
          <Link to="/lotes" className="hover:text-[var(--color-primary)]">
            Lotes
          </Link>
          <Link to="/contact" className="hover:text-[var(--color-primary)]">
            Contacto
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-[var(--color-primary)]">
                Dashboard
              </Link>
              <Link to="/mi-panel" className="hover:text-[var(--color-primary)]">
                Mi panel
              </Link>
              {(user.role === "admin" || user.role === "empleado") && (
                <>
                  <Link to="/gestion" className="hover:text-[var(--color-primary)]">
                    Gestion
                  </Link>
                  <Link to="/consultas" className="hover:text-[var(--color-primary)]">
                    Consultas
                    {pendingConsultas > 0 && (
                      <span className="ml-2 inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs font-bold text-black">
                        {pendingConsultas}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <button type="button" className="btn btn-primary text-sm" onClick={logout}>
                Cerrar sesion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline text-sm">
                Ingresar
              </Link>
              <Link to="/register" className="btn btn-primary text-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
