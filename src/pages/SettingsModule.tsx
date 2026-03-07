import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const moduleContent = {
  "/perfil": {
    eyebrow: "Configuracion",
    title: "Mi perfil",
    description: "Espacio reservado para la gestion de tus datos personales y la informacion visible de tu cuenta.",
    bullets: ["Datos personales del usuario", "Informacion de contacto", "Ajustes basicos de cuenta"],
  },
  "/seguridad": {
    eyebrow: "Configuracion",
    title: "Seguridad",
    description: "Centro de control para sesiones, acceso personal y proximas opciones de seguridad de la cuenta.",
    bullets: ["Cierre de sesiones activas", "Controles de acceso personales", "Espacio preparado para password y seguridad avanzada"],
  },
  "/preferencias": {
    eyebrow: "Configuracion",
    title: "Preferencias",
    description: "Modulo inicial para ajustes personales de uso, experiencia y personalizacion futura del portal.",
    bullets: ["Preferencias de interfaz", "Ajustes personales de uso", "Configuracion no operativa del entorno"],
  },
  "/marca": {
    eyebrow: "Configuracion admin",
    title: "Identidad de marca",
    description: "Placeholder administrativo para logo, lineamientos institucionales y activos globales del sitio publico.",
    bullets: ["Logo e imagen institucional", "Recursos visuales globales", "Base para gestion de marca futura"],
  },
  "/editor-sitio": {
    eyebrow: "Configuracion admin",
    title: "Editor del sitio",
    description: "Placeholder para la edicion futura del home publico, bloques destacados y contenido comercial visible.",
    bullets: ["Hero principal", "Imagenes destacadas", "Bloques visuales y comerciales del home"],
  },
} as const;

const SettingsModule: React.FC = () => {
  const location = useLocation();
  const { logoutAll } = useAuth();
  const content = moduleContent[location.pathname as keyof typeof moduleContent];

  if (!content) {
    return null;
  }

  return (
    <section className="page">
      <div className="container">
        <div className="max-w-4xl space-y-6">
          <header className="rounded-[1rem] border border-[rgba(212,175,55,0.18)] bg-[linear-gradient(135deg,rgba(212,175,55,0.1),rgba(18,18,18,0.96)_42%,rgba(18,18,18,0.98)_100%)] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">{content.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{content.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">{content.description}</p>
          </header>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <article className="card space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Estado del modulo</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Base visual preparada</h2>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                Este modulo queda visible en el sidebar y preparado para iteraciones futuras sin inventar backend ni persistencia en esta etapa.
              </p>
              <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                {content.bullets.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <aside className="card space-y-4 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Siguiente paso</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Implementacion gradual</h2>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                La ruta ya existe para consolidar la arquitectura del portal. La logica funcional puede agregarse despues, por modulo y con permisos reales.
              </p>
              {location.pathname === "/seguridad" ? (
                <button
                  type="button"
                  onClick={() => void logoutAll()}
                  className="btn btn-outline w-full text-sm"
                >
                  Cerrar todas las sesiones
                </button>
              ) : null}
              <Link to="/dashboard" className="btn btn-primary w-full text-sm">
                Volver al dashboard
              </Link>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsModule;
