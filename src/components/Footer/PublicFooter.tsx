import { Link } from "react-router-dom";
import { buildLoteWhatsAppUrl, siteConfig } from "../../config/siteConfig";

const PublicFooter: React.FC = () => {
  return (
    <footer className="mt-14 border-t border-white/10 bg-[linear-gradient(180deg,rgba(10,10,10,0.92),rgba(0,0,0,0.98))] text-white">
      <div className="container grid gap-8 py-12 sm:py-14 md:grid-cols-[1.25fr_0.8fr_0.9fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1rem] border border-[rgba(212,175,55,0.28)] bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.2),rgba(212,175,55,0.04)_52%,rgba(255,255,255,0.02)_100%)] text-sm font-semibold text-[var(--color-primary)] shadow-[0_14px_28px_rgba(0,0,0,0.28)]">
              <span className="absolute inset-[5px] rounded-[0.8rem] border border-[rgba(255,255,255,0.08)]" />
              <span className="relative z-10 tracking-[0.18em]">RP</span>
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[rgba(255,255,255,0.55)]">Inmobiliaria digital</p>
              <p className="text-lg font-semibold tracking-[0.06em] text-white">{siteConfig.brandName}</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[var(--color-text-muted)]">{siteConfig.brandSubtitle}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-[rgba(255,255,255,0.48)]">{siteConfig.businessLocationLabel}</p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Navegacion</p>
          <nav className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
            <Link className="transition hover:text-white" to="/">Inicio</Link>
            <Link className="transition hover:text-white" to="/lotes">Lotes</Link>
            <Link className="transition hover:text-white" to="/contact">Contacto</Link>
          </nav>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Contacto</p>
          <div className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
            <a className="transition hover:text-white" href={`mailto:${siteConfig.contactEmail}`}>
              {siteConfig.contactEmail}
            </a>
            <a className="transition hover:text-white" href={buildLoteWhatsAppUrl(null)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <span>{siteConfig.businessLocationLabel}</span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">Redes</p>
          <div className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
            <a className="transition hover:text-white" href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <Link className="transition hover:text-white" to="/contact">
              Contactar asesor
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container flex flex-col gap-2 text-xs text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>{new Date().getFullYear()} {siteConfig.brandName}. Todos los derechos reservados.</span>
          <span className="uppercase tracking-[0.18em] text-[rgba(255,255,255,0.45)]">Catalogo inmobiliario y gestion comercial</span>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
