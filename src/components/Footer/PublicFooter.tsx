import { Link } from "react-router-dom";
import { buildLoteWhatsAppUrl, siteConfig } from "../../config/siteConfig";

const PublicFooter: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-white/10 bg-black/70 text-white">
      <div className="container grid gap-8 py-10 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">{siteConfig.brandName}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{siteConfig.brandSubtitle}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{siteConfig.businessLocationLabel}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Navegacion</p>
          <nav className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
            <Link className="transition hover:text-white" to="/">Inicio</Link>
            <Link className="transition hover:text-white" to="/lotes">Lotes</Link>
            <Link className="transition hover:text-white" to="/contact">Contacto</Link>
          </nav>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Contacto</p>
          <div className="flex flex-col gap-2 text-sm text-[var(--color-text-muted)]">
            <a className="transition hover:text-white" href={buildLoteWhatsAppUrl(null)} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <a className="transition hover:text-white" href={`mailto:${siteConfig.contactEmail}`}>
              {siteConfig.contactEmail}
            </a>
            <a className="transition hover:text-white" href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="container text-xs text-[var(--color-text-muted)]">
          {new Date().getFullYear()} {siteConfig.brandName}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
