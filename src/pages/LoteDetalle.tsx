import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import ContactModal from "../components/ContactModal";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import MapView from "../components/MapView/MapView";
import { commercialApi } from "../services/commercialApi";
import { getPrimaryLoteImage, LOTE_IMAGE_FALLBACK_SRC, resolveLoteImageUrl } from "../utils/resolveLoteImageUrl";

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
        <button type="button" className="btn btn-outline text-sm" onClick={() => navigate("/lotes")}>
          Volver a lotes
        </button>

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
            <article className="card overflow-hidden">
              <div className="relative">
                <img
                  src={imageSrc}
                  alt={lote.title}
                  className="h-64 w-full object-cover md:h-[420px]"
                  loading="eager"
                  onError={() => {
                    if (imageSrc !== LOTE_IMAGE_FALLBACK_SRC) {
                      setImageSrc(LOTE_IMAGE_FALLBACK_SRC);
                    }
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
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
                <div className="absolute bottom-4 left-4 space-y-1">
                  <p className="text-2xl font-bold text-[var(--color-primary)] md:text-3xl">
                    ${lote.price.toLocaleString("es-AR")} USD
                  </p>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">{lote.title}</h1>
                  {lote.address && <p className="text-sm text-[var(--color-text-muted)] md:text-base">{lote.address}</p>}
                </div>
              </div>
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3 md:grid-cols-6">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`overflow-hidden rounded border ${image === imageSrc ? "border-[var(--color-primary)]" : "border-transparent"}`}
                      onClick={() => setImageSrc(image)}
                    >
                      <img src={image} alt={`Miniatura ${index + 1}`} className="h-16 w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </article>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Precio</p>
                <p className="mt-2 text-xl font-semibold text-white">${lote.price.toLocaleString("es-AR")} USD</p>
              </div>
              <div className="card p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Superficie</p>
                <p className="mt-2 text-xl font-semibold text-white">{lote.size} m2</p>
              </div>
              <div className="card p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Ubicacion</p>
                <p className="mt-2 text-base text-white">{lote.address || "Sin direccion disponible"}</p>
              </div>
            </div>

            {lote.description && (
              <article className="card p-4">
                <h2 className="text-lg font-semibold text-white">Descripcion</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{lote.description}</p>
              </article>
            )}

            <article className="card p-4">
              <h2 className="text-lg font-semibold text-white">Amenities</h2>
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

            <article className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Ubicacion</h2>
              <MapView lote={lote} />
            </article>

            <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm text-[var(--color-text-muted)]">Interesado en este lote?</p>
                <p className="text-base font-semibold text-white">Recibe atencion comercial personalizada.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => setIsContactOpen(true)}>
                Consultar por este lote
              </button>
            </div>
          </>
        )}
      </div>

      <ContactModal isOpen={isContactOpen} lote={lote ?? null} onClose={() => setIsContactOpen(false)} />
    </section>
  );
};

export default LoteDetalle;
