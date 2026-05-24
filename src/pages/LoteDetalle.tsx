import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContactModal from "../components/ContactModal";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import MapView from "../components/MapView/MapView";
import { commercialApi } from "../services/commercialApi";
import { getPrimaryLoteImage, LOTE_IMAGE_FALLBACK_SRC, resolveLoteImageUrl } from "../utils/resolveLoteImageUrl";

const WHATSAPP_URL = "https://wa.me/5490000000000";
const CONTACT_EMAIL = "ventas@raicespuntanas.com";
const INSTAGRAM_URL = "https://instagram.com/raicespuntanas";

const LoteDetalle: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const loteId = Number(id);
  const hasValidId = Number.isInteger(loteId) && loteId > 0;

  const {
    data: lote,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lote-detalle", loteId],
    enabled: hasValidId,
    queryFn: () => commercialApi.getLoteById(loteId),
  });

  const mainImage = useMemo(() => {
    if (!lote) return "";
    return resolveLoteImageUrl(getPrimaryLoteImage(lote));
  }, [lote]);
  const [imageSrc, setImageSrc] = useState(mainImage);
  const googleMapsUrl = useMemo(() => {
    if (!lote) return "";
    return `https://www.google.com/maps?q=${Number(lote.lat)},${Number(lote.lng)}`;
  }, [lote]);
  const hasValidCoords = useMemo(() => {
    if (!lote) return false;
    return Number.isFinite(Number(lote.lat)) && Number.isFinite(Number(lote.lng));
  }, [lote]);
  const galleryImages = useMemo(() => {
    if (!lote) return [];
    const fromGallery = (lote.imagenes ?? [])
      .map((img) => resolveLoteImageUrl(img.url))
      .filter((value, index, array) => value && array.indexOf(value) === index);
    if (fromGallery.length > 0) return fromGallery;
    return [resolveLoteImageUrl(lote.image)];
  }, [lote]);

  useEffect(() => {
    setImageSrc(mainImage);
  }, [mainImage]);

  if (!hasValidId) {
    return (
      <section className="page">
        <div className="container">
          <SectionError title="Lote invalido" message="El identificador del lote no es valido." />
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="container space-y-5">
        {isLoading && (
          <SectionLoading
            title="Cargando detalle del lote"
            message="Estamos preparando toda la informacion del lote seleccionado."
          />
        )}

        {!isLoading && error && (
          <SectionError
            title="No pudimos cargar el lote"
            message={error instanceof Error ? error.message : "Error al cargar el detalle del lote"}
          />
        )}

        {!isLoading && !error && !lote && (
          <SectionEmpty
            title="Lote no encontrado"
            message="Este lote no esta disponible actualmente o fue eliminado."
            action={(
              <button type="button" className="btn btn-primary text-sm" onClick={() => navigate("/lotes")}>
                Volver al catalogo
              </button>
            )}
          />
        )}

        {!isLoading && !error && lote && (
          <>
            <div className="pt-1">
              <Link
                to="/lotes"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:text-white"
              >
                <span aria-hidden="true">{"<-"}</span>
                Volver a lotes
              </Link>
            </div>

            <section className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
              <article className="card overflow-hidden border border-white/10">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={imageSrc}
                    alt={lote.title}
                    className="h-64 w-full object-cover md:h-[380px]"
                    loading="eager"
                    onError={() => {
                      if (imageSrc !== LOTE_IMAGE_FALLBACK_SRC) {
                        setImageSrc(LOTE_IMAGE_FALLBACK_SRC);
                      }
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                      Disponible
                    </span>
                    {(lote.imagenes?.length ?? 0) > 1 && (
                      <span className="rounded-full border border-white/20 bg-black/45 px-3 py-1 text-xs font-semibold text-white">
                        {`${lote.imagenes?.length} fotos`}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h1 className="text-2xl font-bold text-white md:text-3xl">{lote.title}</h1>
                    {lote.address && <p className="mt-1 text-sm text-gray-200 md:text-base">{lote.address}</p>}
                  </div>
                </div>
                {galleryImages.length > 1 && (
                  <div className="overflow-x-auto border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
                    <div className="flex min-w-max gap-2">
                      {galleryImages.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          className={`overflow-hidden rounded-lg border transition ${
                            image === imageSrc
                              ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/50"
                              : "border-white/10 hover:border-white/30"
                          }`}
                          onClick={() => setImageSrc(image)}
                        >
                          <img src={image} alt={`Miniatura ${index + 1}`} className="h-16 w-24 object-cover md:h-20 md:w-28" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </article>

              <aside className="card flex h-fit flex-col gap-4 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Precio</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">${lote.price.toLocaleString("es-AR")} USD</p>
                  <div className="mt-3">
                    <span className="rounded-full border border-emerald-300/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                      Disponible
                    </span>
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-[var(--color-text-muted)]">
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                    <span>Superficie</span>
                    <strong className="text-white">{lote.size} m2</strong>
                  </div>
                </div>

                <button type="button" className="btn btn-primary w-full" onClick={() => setIsContactOpen(true)}>
                  Consultar por este lote
                </button>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">Contacto rapido</p>
                  <div className="grid grid-cols-3 gap-2">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Contactar por WhatsApp"
                      className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-center text-xs text-[var(--color-text-muted)] transition hover:border-white/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                    >
                      <span className="mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300">W</span>
                      WhatsApp
                    </a>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      aria-label="Contactar por Email"
                      className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-center text-xs text-[var(--color-text-muted)] transition hover:border-white/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                    >
                      <span className="mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-300">@</span>
                      Email
                    </a>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ver Instagram"
                      className="rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-center text-xs text-[var(--color-text-muted)] transition hover:border-white/25 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                    >
                      <span className="mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500/20 text-[10px] font-bold text-pink-300">IG</span>
                      Instagram
                    </a>
                  </div>
                </div>

                <p className="text-xs text-[var(--color-text-muted)]">
                  Recibe atencion comercial personalizada y coordinamos una visita.
                </p>
              </aside>
            </section>

            <article className="card p-5">
              <h2 className="text-lg font-semibold text-white">Detalles del lote</h2>
              {lote.description ? (
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{lote.description}</p>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  Proximamente agregaremos mas informacion detallada de este lote.
                </p>
              )}
            </article>

            <article className="card p-5">
              <h2 className="text-lg font-semibold text-white">Comodidades</h2>
              {lote.amenities.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {lote.amenities.map((amenity) => (
                    <span
                      key={amenity.id}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-[var(--color-text-muted)]"
                    >
                      {amenity.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">Este lote no tiene amenities informadas.</p>
              )}
            </article>

            <article className="card p-5">
              <h2 className="mb-4 text-lg font-semibold text-white">Ubicacion y entorno</h2>
              <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
                <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
                  <MapView lote={lote} desktopHeightClass="md:h-[340px]" />
                </div>
                <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Direccion</p>
                    <p className="mt-1 text-sm text-white">{lote.address || "Sin direccion disponible"}</p>
                  </div>
                  {hasValidCoords && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Coordenadas</p>
                      <p className="mt-1 text-sm text-white">
                        {Number(lote.lat).toFixed(6)}, {Number(lote.lng).toFixed(6)}
                      </p>
                    </div>
                  )}
                  {hasValidCoords && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir ubicacion en Google Maps"
                      className="btn btn-outline w-full text-sm"
                    >
                      Abrir en Google Maps
                    </a>
                  )}
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Ubicacion referencial del lote. Coordina una visita para recibir indicaciones precisas y asesoramiento personalizado.
                  </p>
                </div>
              </div>
            </article>
          </>
        )}
      </div>

      <ContactModal isOpen={isContactOpen} lote={lote ?? null} onClose={() => setIsContactOpen(false)} />
    </section>
  );
};

export default LoteDetalle;
