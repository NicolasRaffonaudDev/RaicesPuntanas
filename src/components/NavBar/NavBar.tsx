import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { preloaders } from "../../routes/lazy-pages";
import { commercialApi } from "../../services/commercialApi";
import { API_ORIGIN } from "../../services/apiClient";
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

    const socket = io(API_ORIGIN, { transports: ["polling"] });
    socket.on("audit:created", (entry: { action?: string }) => {
      if (entry?.action?.startsWith("consulta.")) {
        void loadPendingConsultas();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [canManageConsultas, loadPendingConsultas]);

  useEffect(() => {
    const warmCriticalRoutes = () => {
      void preloaders.lotes();
      void preloaders.contacto();

      if (user) {
        void preloaders.dashboard();
        void preloaders.miPanel();
      } else {
        void preloaders.login();
        void preloaders.register();
      }

      if (user?.role === "admin" || user?.role === "empleado") {
        void preloaders.consultas();
      }
    };

    const requestIdle = window.requestIdleCallback?.bind(window);
    const cancelIdle = window.cancelIdleCallback?.bind(window);

    if (requestIdle && cancelIdle) {
      const id = requestIdle(warmCriticalRoutes, { timeout: 1500 });
      return () => cancelIdle(id);
    }

    const timeout = window.setTimeout(warmCriticalRoutes, 800);
    return () => window.clearTimeout(timeout);
  }, [user]);

  const onPrefetch = (key: keyof typeof preloaders) => () => {
    void preloaders[key]();
  };

  const navItemClass =
    "rounded-full px-3 py-2 text-sm font-medium text-[rgba(255,255,255,0.82)] transition-[background-color,color,border-color,box-shadow] duration-180 hover:bg-[rgba(212,175,55,0.08)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

  return (
    <nav className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.84)] px-4 py-4 text-white backdrop-blur-xl">
      <div className="container flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="group flex items-center gap-3 rounded-full pr-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.28)] focus-visible:ring-offset-2 focus-visible:ring-offset-black">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(212,175,55,0.24)] bg-[linear-gradient(180deg,rgba(212,175,55,0.14),rgba(212,175,55,0.04))] text-sm font-semibold text-[var(--color-primary)] shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
            RP
          </span>
          <span className="space-y-0.5">
            <span className="block text-lg font-semibold tracking-[0.04em] text-white">Raices Puntanas</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-text-muted)] transition group-hover:text-[var(--color-primary)]">
              Panel comercial
            </span>
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full border border-[rgba(212,175,55,0.22)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm font-medium text-[rgba(255,255,255,0.9)] transition-[border-color,background-color,color] duration-180 hover:border-[rgba(212,175,55,0.36)] hover:bg-[rgba(212,175,55,0.08)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-black md:hidden"
          type="button"
        >
          Menu
        </button>
        <div
          className={`w-full flex-col gap-3 rounded-[1rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(18,18,18,0.92)] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.24)] md:flex md:w-auto md:flex-row md:items-center md:rounded-full md:border-[rgba(255,255,255,0.05)] md:bg-[rgba(255,255,255,0.02)] md:p-2 md:shadow-none ${
            isOpen ? "flex" : "hidden"
          }`}
        >
          <Link to="/lotes" className={navItemClass} onMouseEnter={onPrefetch("lotes")} onFocus={onPrefetch("lotes")}>
            Lotes
          </Link>
          <Link to="/contact" className={navItemClass} onMouseEnter={onPrefetch("contacto")} onFocus={onPrefetch("contacto")}>
            Contacto
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className={navItemClass} onMouseEnter={onPrefetch("dashboard")} onFocus={onPrefetch("dashboard")}>
                Dashboard
              </Link>
              <Link to="/mi-panel" className={navItemClass} onMouseEnter={onPrefetch("miPanel")} onFocus={onPrefetch("miPanel")}>
                Mi panel
              </Link>
              {(user.role === "admin" || user.role === "empleado") && (
                <>
                  <Link to="/gestion" className={navItemClass} onMouseEnter={onPrefetch("gestion")} onFocus={onPrefetch("gestion")}>
                    Gestion
                  </Link>
                  <Link
                    to="/consultas"
                    className={`${navItemClass} flex items-center justify-between gap-2 md:justify-center`}
                    onMouseEnter={onPrefetch("consultas")}
                    onFocus={onPrefetch("consultas")}
                  >
                    <span>Consultas</span>
                    {pendingConsultas > 0 && (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-[rgba(212,175,55,0.28)] bg-[rgba(212,175,55,0.12)] px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                        {pendingConsultas}
                      </span>
                    )}
                  </Link>
                </>
              )}
              <button
                type="button"
                className="rounded-full border border-[rgba(212,175,55,0.24)] bg-[linear-gradient(180deg,rgba(212,175,55,0.14),rgba(212,175,55,0.08))] px-4 py-2 text-sm font-medium text-white transition-[border-color,background-color,color,transform,box-shadow] duration-180 hover:border-[rgba(212,175,55,0.42)] hover:bg-[linear-gradient(180deg,rgba(212,175,55,0.18),rgba(212,175,55,0.12))] hover:shadow-[0_12px_24px_rgba(0,0,0,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.34)] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-[1px]"
                onClick={logout}
              >
                Cerrar sesion
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full border border-[rgba(212,175,55,0.22)] px-4 py-2 text-sm font-medium text-[rgba(255,255,255,0.92)] transition-[border-color,background-color,color] duration-180 hover:border-[rgba(212,175,55,0.38)] hover:bg-[rgba(212,175,55,0.08)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                onMouseEnter={onPrefetch("login")}
                onFocus={onPrefetch("login")}
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-[rgba(212,175,55,0.26)] bg-[linear-gradient(180deg,rgba(212,175,55,0.14),rgba(212,175,55,0.08))] px-4 py-2 text-sm font-medium text-white transition-[border-color,background-color,color,transform,box-shadow] duration-180 hover:border-[rgba(212,175,55,0.42)] hover:bg-[linear-gradient(180deg,rgba(212,175,55,0.18),rgba(212,175,55,0.12))] hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.34)] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-[1px]"
                onMouseEnter={onPrefetch("register")}
                onFocus={onPrefetch("register")}
              >
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
