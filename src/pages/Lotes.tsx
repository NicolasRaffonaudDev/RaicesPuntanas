import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import LotCard from "../components/LotCard/LotCard";
import { useAuth } from "../context/useAuth";
import { commercialApi } from "../services/commercialApi";
import type { Lote } from "../types/interfaces";
import { hasPermission } from "../utils/permissions";

interface LoteFormState {
  title: string;
  price: string;
  size: string;
  description: string;
  amenities: string;
  image: string;
  lat: string;
  lng: string;
}

const emptyLoteForm: LoteFormState = {
  title: "",
  price: "",
  size: "",
  description: "",
  amenities: "",
  image: "",
  lat: "",
  lng: "",
};

const Lotes: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [allAmenities, setAllAmenities] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [error, setError] = useState("");
  const [favoriteError, setFavoriteError] = useState("");
  const [compareError, setCompareError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [filtroPrecio, setFiltroPrecio] = useState(0);
  const [orden, setOrden] = useState<"recomendado" | "precio_asc" | "precio_desc" | "tamano_desc">("recomendado");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoteId, setEditingLoteId] = useState<number | null>(null);
  const [formState, setFormState] = useState<LoteFormState>(emptyLoteForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadLotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await commercialApi.listLotes({
        page,
        limit,
        minPrice: filtroPrecio > 0 ? filtroPrecio : undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        sort: orden === "recomendado" ? undefined : (orden as "price_asc" | "price_desc" | "size_desc"),
      });
      setLotes(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar lotes");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filtroPrecio, selectedAmenities, orden]);

  useEffect(() => {
    void loadLotes();
  }, [loadLotes]);

  useEffect(() => {
    if (!token || !hasPermission(user?.role, "favoritos.read")) {
      setFavoriteIds(new Set());
      return;
    }

    setFavoritesLoading(true);
    commercialApi
      .listFavoritos(token)
      .then((items) => {
        setFavoriteIds(new Set(items.map((item) => item.loteId)));
      })
      .catch((err: Error) => setFavoriteError(err.message))
      .finally(() => setFavoritesLoading(false));
  }, [token, user?.role]);

  useEffect(() => {
    commercialApi
      .getLoteFilters()
      .then((data) => setAllAmenities(data.amenities))
      .catch(() => setAllAmenities([]));
  }, []);

  const handleAmenityChange = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity],
    );
    setPage(1);
  };

  const resetFilters = () => {
    setFiltroPrecio(0);
    setSelectedAmenities([]);
    setOrden("recomendado");
    setPage(1);
  };

  const canManageFavorites = !!token && hasPermission(user?.role, "favoritos.write");
  const canManageLotes = !!token && hasPermission(user?.role, "lotes.write");
  const canDeleteLotes = !!token && hasPermission(user?.role, "lotes.delete");

  const toggleCompare = (loteId: number) => {
    setCompareError("");
    setCompareIds((prev) => {
      const next = new Set(prev);
      if (next.has(loteId)) {
        next.delete(loteId);
        return next;
      }

      if (next.size >= 3) {
        setCompareError("Puedes comparar hasta 3 lotes a la vez.");
        return prev;
      }

      next.add(loteId);
      return next;
    });
  };

  const goToCompare = () => {
    if (compareIds.size < 2) {
      setCompareError("Selecciona al menos 2 lotes para comparar.");
      return;
    }

    navigate(`/comparar?ids=${Array.from(compareIds).join(",")}`);
  };

  const toggleFavorite = async (lote: Lote) => {
    if (!token || !canManageFavorites) return;

    setFavoriteError("");
    const isFavorite = favoriteIds.has(lote.id);

    try {
      if (isFavorite) {
        await commercialApi.removeFavorito(token, lote.id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(lote.id);
          return next;
        });
      } else {
        await commercialApi.addFavorito(token, lote.id);
        setFavoriteIds((prev) => new Set(prev).add(lote.id));
      }
    } catch (err) {
      setFavoriteError(err instanceof Error ? err.message : "No se pudo actualizar favorito");
    }
  };

  const openCreateModal = () => {
    setEditingLoteId(null);
    setFormState(emptyLoteForm);
    setMutationError("");
    setIsModalOpen(true);
  };

  const openEditModal = (lote: Lote) => {
    setEditingLoteId(lote.id);
    setFormState({
      title: lote.title,
      price: String(lote.price),
      size: String(lote.size),
      description: lote.description || "",
      amenities: lote.amenities.join(", "),
      image: lote.image,
      lat: String(lote.lat),
      lng: String(lote.lng),
    });
    setMutationError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLoteId(null);
    setFormState(emptyLoteForm);
    setMutationError("");
  };

  const submitLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !canManageLotes) return;

    setIsSaving(true);
    setMutationError("");

    const payload = {
      title: formState.title.trim(),
      price: Number(formState.price),
      size: Number(formState.size),
      description: formState.description.trim() || undefined,
      amenities: formState.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      image: formState.image.trim(),
      lat: Number(formState.lat),
      lng: Number(formState.lng),
    };

    try {
      if (editingLoteId === null) {
        await commercialApi.createLote(token, payload);
      } else {
        await commercialApi.updateLote(token, editingLoteId, payload);
      }
      await loadLotes();
      closeModal();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "No se pudo guardar el lote");
    } finally {
      setIsSaving(false);
    }
  };

  const removeLote = async (loteId: number) => {
    if (!token || !canDeleteLotes) return;
    const confirmed = window.confirm("Se eliminara el lote seleccionado. Esta accion no se puede deshacer.");
    if (!confirmed) return;

    setMutationError("");
    try {
      await commercialApi.deleteLote(token, loteId);
      await loadLotes();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "No se pudo eliminar el lote");
    }
  };

  const buildPageItems = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, idx) => idx + 1);
    const safeCurrent = Math.max(1, Math.min(current, total));
    const candidates = new Set([1, total, safeCurrent - 1, safeCurrent, safeCurrent + 1]);
    const pages = Array.from(candidates).filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

    const items: Array<number | "ellipsis"> = [];
    let prev = 0;
    for (const pageNum of pages) {
      if (prev && pageNum - prev > 1) items.push("ellipsis");
      items.push(pageNum);
      prev = pageNum;
    }
    return items;
  };

  return (
    <section className="page">
      <div className="container space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Lotes Disponibles</h1>
          {canManageLotes && (
            <button type="button" className="btn btn-primary text-sm" onClick={openCreateModal}>
              Nuevo lote
            </button>
          )}
        </div>

        <div className="card grid gap-4 p-4 md:grid-cols-2">
          <div>
            <label htmlFor="precio-min" className="mb-1 block text-sm text-[var(--color-text-muted)]">
              Precio minimo (USD)
            </label>
            <input
              id="precio-min"
              type="number"
              value={filtroPrecio}
              onChange={(e) => {
                setFiltroPrecio(Number(e.target.value) || 0);
                setPage(1);
              }}
              placeholder="Ej: 40000"
              className="field"
            />
          </div>
          <div>
            <p className="mb-1 text-sm text-[var(--color-text-muted)]">Filtrar por amenities</p>
            <div className="flex flex-wrap gap-3 text-sm">
              {allAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="orden-lotes" className="mb-1 block text-sm text-[var(--color-text-muted)]">
              Ordenar por
            </label>
            <select
              id="orden-lotes"
              className="field"
              value={orden}
              onChange={(e) => {
                setOrden(e.target.value as "recomendado" | "precio_asc" | "precio_desc" | "tamano_desc");
                setPage(1);
              }}
            >
              <option value="recomendado">Recomendado</option>
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="tamano_desc">Tamano: mayor a menor</option>
            </select>
          </div>
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3 text-sm">
            <p className="text-[var(--color-text-muted)]">
              Mostrando <strong className="text-[var(--color-primary)]">{meta.total || lotes.length}</strong> lotes.
            </p>
            {lotes.length > 0 && (
              <p className="mt-1 text-[var(--color-text-muted)]">
                Desde <strong className="text-[var(--color-primary)]">${Math.min(...lotes.map((l) => l.price)).toLocaleString("es-AR")}</strong> USD
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Comparador activo: <strong className="text-[var(--color-primary)]">{compareIds.size}</strong>/3 lotes seleccionados.
                </p>
                <button type="button" className="btn btn-primary text-sm" data-testid="compare-button" onClick={goToCompare}>
                  Comparar en mapa
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <SectionLoading
            title="Cargando lotes"
            message="Estamos consultando el listado disponible para mostrarte las opciones activas."
          />
        )}
        {!loading && error && (
          <SectionError
            title="No pudimos cargar los lotes"
            message={error}
          />
        )}
        {mutationError && <p className="text-center text-red-300">{mutationError}</p>}
        {favoriteError && <p className="text-center text-amber-300">{favoriteError}</p>}
        {compareError && <p className="text-center text-amber-300">{compareError}</p>}

        {!loading && !error && lotes.length === 0 && (
          <SectionEmpty
            title="No encontramos lotes con esos filtros"
            message="Prueba limpiar los filtros actuales o ajustar el rango de precio y amenities para ampliar los resultados."
            action={(
              <button type="button" className="btn btn-outline text-sm" onClick={resetFilters}>
                Limpiar filtros
              </button>
            )}
          />
        )}

        {!loading && !error && lotes.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lotes.map((lote, index) => (
              <div key={lote.id} className="space-y-2">
                <LotCard lote={lote} prioritizeImage={index < 2} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn ${compareIds.has(lote.id) ? "btn-primary" : "btn-outline"} flex-1 text-sm`}
                    data-testid={`compare-toggle-${lote.id}`}
                    onClick={() => toggleCompare(lote.id)}
                  >
                    {compareIds.has(lote.id) ? "En comparador" : "Comparar"}
                  </button>
                  <button
                    type="button"
                    className={`btn ${favoriteIds.has(lote.id) ? "btn-outline" : "btn-primary"} flex-1 text-sm`}
                    onClick={() => void toggleFavorite(lote)}
                    disabled={!canManageFavorites || favoritesLoading}
                  >
                    {favoriteIds.has(lote.id) ? "Quitar favorito" : "Guardar favorito"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline flex-1 text-sm"
                    onClick={() => navigate(`/contact?loteId=${lote.id}&asunto=${encodeURIComponent(`Consulta por ${lote.title}`)}`)}
                  >
                    Consultar
                  </button>
                </div>
                {canManageLotes && (
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-outline flex-1 text-sm" onClick={() => openEditModal(lote)}>
                      Editar
                    </button>
                    {canDeleteLotes && (
                      <button type="button" className="btn btn-outline flex-1 text-sm" onClick={() => void removeLote(lote.id)}>
                        Eliminar
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className="btn btn-outline"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </button>
            {buildPageItems(page, meta.totalPages).map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-[var(--color-text-muted)]">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${item}`}
                  type="button"
                  className={`btn ${item === page ? "btn-primary" : "btn-outline"}`}
                  aria-current={item === page ? "page" : undefined}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              className="btn btn-outline"
              disabled={page === meta.totalPages}
              onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="card w-full max-w-3xl p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">Catalogo admin</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {editingLoteId === null ? "Nuevo lote" : "Editar lote"}
                </h2>
              </div>
              <button type="button" className="btn btn-outline text-sm" onClick={closeModal}>
                Cerrar
              </button>
            </div>

            <form className="grid gap-3 md:grid-cols-2" onSubmit={submitLote}>
              <input
                className="field"
                placeholder="Nombre del lote"
                value={formState.title}
                onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
              <input
                className="field"
                type="number"
                min={1}
                placeholder="Precio"
                value={formState.price}
                onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                required
              />
              <input
                className="field"
                type="number"
                min={1}
                placeholder="Superficie"
                value={formState.size}
                onChange={(e) => setFormState((prev) => ({ ...prev, size: e.target.value }))}
                required
              />
              <input
                className="field"
                placeholder="Amenities separadas por coma"
                value={formState.amenities}
                onChange={(e) => setFormState((prev) => ({ ...prev, amenities: e.target.value }))}
              />
              <input
                className="field md:col-span-2"
                placeholder="Imagen (URL)"
                value={formState.image}
                onChange={(e) => setFormState((prev) => ({ ...prev, image: e.target.value }))}
                required
              />
              <textarea
                className="field md:col-span-2"
                rows={4}
                placeholder="Descripcion"
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              />
              <input
                className="field"
                type="number"
                step="any"
                placeholder="Latitud"
                value={formState.lat}
                onChange={(e) => setFormState((prev) => ({ ...prev, lat: e.target.value }))}
                required
              />
              <input
                className="field"
                type="number"
                step="any"
                placeholder="Longitud"
                value={formState.lng}
                onChange={(e) => setFormState((prev) => ({ ...prev, lng: e.target.value }))}
                required
              />

              {mutationError && <p className="text-sm text-red-300 md:col-span-2">{mutationError}</p>}

              <div className="flex gap-2 md:col-span-2 md:justify-end">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? "Guardando..." : editingLoteId === null ? "Crear lote" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Lotes;
