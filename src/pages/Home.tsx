import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import { siteConfig } from "../config/siteConfig";
import { useAuth } from "../context/useAuth";
import { commercialApi } from "../services/commercialApi";
import { resolvePrimaryLoteImageUrl } from "../utils/resolveLoteImageUrl";

const Home: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrEmployee = user?.role === "admin" || user?.role === "empleado";
  const isCommonUser = user?.role === "usuario";
  const isVisitor = !user;
  const dashboardRoute = user?.role === "usuario" ? "/mi-panel" : "/dashboard";

  const {
    data: featuredResponse,
    isLoading: featuredLoading,
    error: featuredError,
  } = useQuery({
    queryKey: ["home-featured-lotes", "destacados"],
    queryFn: () => commercialApi.listLotes({ page: 1, limit: 3, destacado: true, sort: "price_desc" }),
  });

  const highlightedLotes = featuredResponse?.data ?? [];
  const shouldFallback = !featuredLoading && !featuredError && highlightedLotes.length === 0;
  const {
    data: fallbackResponse,
    isLoading: fallbackLoading,
    error: fallbackError,
  } = useQuery({
    queryKey: ["home-featured-lotes", "fallback"],
    enabled: shouldFallback,
    queryFn: () => commercialApi.listLotes({ page: 1, limit: 3, sort: "price_desc" }),
  });

  const featuredLotes = highlightedLotes.length > 0 ? highlightedLotes : fallbackResponse?.data ?? [];
  const hasFeaturedError = !!featuredError || !!fallbackError;
  const isFeaturedLoading = featuredLoading || fallbackLoading;

  return (
    <section className="page">
      <div className="container space-y-10">
        <section className="card relative overflow-hidden px-6 py-12 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,215,0,0.22),_transparent_58%)]" />
          <div className="relative z-10 grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4 sm:space-y-5">
              {isAdminOrEmployee ? (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">
                    Vista operativa
                  </p>
                  <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{siteConfig.brandName}</h1>
                  <p className="max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
                    Estas viendo el sitio como administrador. Accede al panel para gestionar lotes, consultas y operacion comercial.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link className="btn btn-primary" to={dashboardRoute}>
                      Ir al panel
                    </Link>
                    <Link className="btn btn-outline" to="/lotes">
                      Gestionar lotes
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">
                    {siteConfig.brandSubtitle}
                  </p>
                  <h1 className="text-3xl font-bold leading-tight sm:text-5xl">{siteConfig.brandName}</h1>
                  <p className="max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
                    Descubri lotes seleccionados en ubicaciones estrategicas, con asesoramiento cercano y una experiencia clara para tomar decisiones con confianza.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link className="btn btn-primary min-w-[200px]" to="/lotes">
                      Ver lotes disponibles
                    </Link>
                    <Link className="btn btn-outline" to="/contact">
                      Contactar asesor
                    </Link>
                    {isCommonUser && (
                      <Link className="btn btn-outline" to={dashboardRoute}>
                        Ir a mi panel
                      </Link>
                    )}
                    {isVisitor && (
                      <Link className="btn btn-outline" to="/register">
                        Crear cuenta
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-sm shadow-[0_18px_38px_rgba(0,0,0,0.32)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Propuesta de valor</p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--color-text-muted)]">
                <li>Seleccion de lotes con informacion clara y visual.</li>
                <li>Acompanamiento comercial para cada etapa de la compra.</li>
                <li>Contacto rapido por formulario, WhatsApp y canales directos.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Lotes destacados</h2>
            <Link className="text-sm font-medium text-[var(--color-primary)] transition hover:opacity-80" to="/lotes">
              Ver todos
            </Link>
          </div>

          {isFeaturedLoading && (
            <SectionLoading
              title="Cargando lotes destacados"
              message="Estamos seleccionando opciones para mostrarte en portada."
              compact
            />
          )}
          {!isFeaturedLoading && hasFeaturedError && (
            <SectionError
              title="No pudimos cargar destacados"
              message={
                featuredError instanceof Error
                  ? featuredError.message
                  : fallbackError instanceof Error
                    ? fallbackError.message
                    : "Intentalo nuevamente en unos minutos."
              }
              compact
            />
          )}
          {!isFeaturedLoading && !hasFeaturedError && featuredLotes.length === 0 && (
            <SectionEmpty
              title="Aun no hay lotes destacados"
              message="Estamos preparando nuevas opciones. Mientras tanto, podes explorar el catalogo completo."
              compact
              action={(
                <Link className="btn btn-outline text-sm" to="/lotes">
                  Ver catalogo
                </Link>
              )}
            />
          )}
          {!isFeaturedLoading && !hasFeaturedError && featuredLotes.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {featuredLotes.map((lote) => (
                <article key={lote.id} className="card group overflow-hidden rounded-2xl p-0 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(0,0,0,0.36)]">
                  <img
                    src={resolvePrimaryLoteImageUrl(lote)}
                    alt={lote.title}
                    className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                  <div className="space-y-3 p-4">
                    <p className="text-lg font-semibold text-[var(--color-primary)]">${lote.price.toLocaleString("es-AR")} USD</p>
                    <h3 className="line-clamp-1 text-base font-semibold text-white">{lote.title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {lote.address?.trim() || "Ubicacion a confirmar por asesor"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                      <span>{lote.size} m2</span>
                      <span>{lote.amenities.length} comodidades</span>
                    </div>
                    <Link className="btn btn-primary w-full text-sm" to={`/lotes/${lote.id}`}>
                      Ver detalle
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <article className="card space-y-2 p-5 transition duration-200 hover:border-white/20">
            <h3 className="text-base font-semibold text-white">Ubicaciones seleccionadas</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Opciones en zonas con potencial de crecimiento y buena conectividad.
            </p>
          </article>
          <article className="card space-y-2 p-5 transition duration-200 hover:border-white/20">
            <h3 className="text-base font-semibold text-white">Asesoramiento personalizado</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Te acompanamos en cada decision con informacion clara y seguimiento real.
            </p>
          </article>
          <article className="card space-y-2 p-5 transition duration-200 hover:border-white/20">
            <h3 className="text-base font-semibold text-white">Gestion clara y segura</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Proceso ordenado desde la consulta inicial hasta el cierre comercial.
            </p>
          </article>
        </section>

        <section className="card flex flex-col gap-4 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-semibold text-white">Queres conocer mas opciones?</h2>
          <p className="mx-auto max-w-2xl text-sm text-[var(--color-text-muted)]">
            Explora el catalogo completo o escribinos para recibir recomendaciones segun tu presupuesto y objetivo.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link className="btn btn-primary" to="/lotes">
              Ver todos los lotes
            </Link>
            <Link className="btn btn-outline" to="/contact">
              Contactar
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Home;
