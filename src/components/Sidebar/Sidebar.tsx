import { Link, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { getSidebarSections } from "../../config/navigation";
import { useAuth } from "../../context/useAuth";

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const sections = useMemo(() => getSidebarSections(user?.role), [user?.role]);

  const isItemActive = (to: string) => {
    const [targetPath, targetQuery] = to.split("?");
    if (location.pathname !== targetPath) return false;
    if (!targetQuery) return true;
    return location.search.replace(/^\?/, "") === targetQuery;
  };

  const itemClass = (active: boolean) =>
    [
      "group flex items-center justify-between gap-3 rounded-[1rem] px-3.5 py-3 text-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-180",
      active
        ? "border border-[rgba(212,175,55,0.26)] bg-[linear-gradient(180deg,rgba(212,175,55,0.16),rgba(212,175,55,0.06))] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_10px_22px_rgba(0,0,0,0.18)]"
        : "border border-transparent text-[rgba(255,255,255,0.74)] hover:border-[rgba(212,175,55,0.12)] hover:bg-[rgba(255,255,255,0.032)] hover:text-white",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
    ].join(" ");

  const getItemTone = (id: string) => {
    if (["usuarios", "auditoria", "marca", "editor-sitio"].includes(id)) {
      return "text-[rgba(212,175,55,0.9)]";
    }
    return "text-[rgba(255,255,255,0.9)]";
  };

  return (
    <>
      <div className="border-b border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.88)] p-4 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">Portal</p>
            <p className="text-lg font-semibold text-white">Raices Puntanas</p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="rounded-full border border-[rgba(212,175,55,0.24)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Menu
          </button>
        </div>
      </div>

      <aside
        className={`${isOpen ? "flex" : "hidden"} w-full flex-col border-b border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(0,0,0,0.96),rgba(10,10,10,0.98))] p-4 md:flex md:min-h-screen md:w-[19rem] md:flex-shrink-0 md:border-b-0 md:border-r md:border-r-[rgba(255,255,255,0.06)]`}
      >
        <div className="flex h-full flex-col">
          <div className="mb-6 rounded-[1.2rem] border border-[rgba(212,175,55,0.14)] bg-[linear-gradient(160deg,rgba(212,175,55,0.12),rgba(18,18,18,0.96)_44%,rgba(18,18,18,0.98)_100%)] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.22)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border border-[rgba(212,175,55,0.22)] bg-[rgba(0,0,0,0.24)] text-sm font-semibold text-[var(--color-primary)]">
                RP
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">Portal</p>
                <h1 className="truncate text-xl font-semibold text-white">Raices Puntanas</h1>
              </div>
            </div>
            <div className="mt-4 rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.28)] px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.42)]">Sesion activa</p>
              <p className="mt-1 truncate text-sm font-medium text-white">{user?.name}</p>
              <p className="mt-1 text-xs capitalize text-[var(--color-primary)]">{user?.role}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-5">
            {sections.map((section) => (
              <section key={section.id} className="space-y-2.5">
                {section.label ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-2">
                      <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(212,175,55,0),rgba(212,175,55,0.18),rgba(212,175,55,0))]" />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.42)]">
                        {section.label}
                      </p>
                      <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(212,175,55,0),rgba(212,175,55,0.18),rgba(212,175,55,0))]" />
                    </div>
                  </div>
                ) : null}
                <div className="space-y-1 rounded-[1rem] border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.015)] p-1.5">
                  {section.items.map((item) => (
                    <Link
                      key={item.id}
                      to={item.to}
                      className={itemClass(isItemActive(item.to))}
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 rounded-full transition-[background-color,transform] duration-180 ${
                            isItemActive(item.to)
                              ? "bg-[var(--color-primary)] shadow-[0_0_0_4px_rgba(212,175,55,0.08)]"
                              : "bg-[rgba(255,255,255,0.16)] group-hover:bg-[rgba(212,175,55,0.38)]"
                          }`}
                          aria-hidden="true"
                        />
                        <span className={`truncate ${getItemTone(item.id)}`}>{item.label}</span>
                      </span>
                      {isItemActive(item.to) ? (
                        <span className="rounded-full border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.08)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
                          Activo
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </nav>

          <div className="mt-6 border-t border-[rgba(255,255,255,0.08)] pt-4">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center justify-between rounded-[1rem] border border-[rgba(212,175,55,0.18)] bg-[linear-gradient(180deg,rgba(212,175,55,0.09),rgba(212,175,55,0.04))] px-3.5 py-3.5 text-sm font-medium text-white shadow-[0_14px_26px_rgba(0,0,0,0.18)] transition-[border-color,background-color,color,transform] duration-180 hover:border-[rgba(212,175,55,0.34)] hover:bg-[linear-gradient(180deg,rgba(212,175,55,0.12),rgba(212,175,55,0.06))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.3)] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-[1px]"
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(212,175,55,0.18)] bg-[rgba(0,0,0,0.16)] text-[var(--color-primary)]">
                  ●
                </span>
                <span>Cerrar sesion</span>
              </span>
              <span className="text-[var(--color-primary)]" aria-hidden="true">
                →
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
