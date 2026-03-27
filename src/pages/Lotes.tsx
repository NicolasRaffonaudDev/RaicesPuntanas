import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AddressAutocomplete from "../components/AddressAutocomplete";
import AmenitiesSelector from "../components/AmenitiesSelector";
import MapView from "../components/MapView/MapView";
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
  amenities: string[];
  image: string;
  address: string;
  lat: string;
  lng: string;
}

const emptyLoteForm: LoteFormState = {
  title: "",
  price: "",
  size: "",
  description: "",
  amenities: [],
  image: "",
  address: "",
  lat: "",
  lng: "",
};

const Lotes: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set());
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

  const {
    data: lotesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lotes", { page, limit, filtroPrecio, selectedAmenities, orden }],
    queryFn: () =>
      commercialApi.listLotes({
        page,
        limit,
        minPrice: filtroPrecio > 0 ? filtroPrecio : undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        sort: orden === "recomendado" ? undefined : (orden as "price_asc" | "price_desc" | "size_desc"),
      }),
  });

  const lotes = lotesResponse?.data ?? [];

  const { data: loteFilters } = useQuery({
    queryKey: ["lote-filters"],
    queryFn: () => commercialApi.getLoteFilters(),
  });
  const allAmenities = loteFilters?.amenities ?? [];

  const canReadFavoritos = hasPermission(user?.role, "favoritos.read");
  const {
    data: favoriteIds = [],
    isLoading: favoritesLoading,
  } = useQuery({
    queryKey: ["favoritos"],
    enabled: !!token && canReadFavoritos,
    queryFn: () => {
      if (!token) throw new Error("No autenticado");
      return commercialApi.getFavoritos(token);
    },
    onError: (err) => {
      setFavoriteError(err instanceof Error ? err.message : "No se pudo cargar favoritos");
    },
  });

  const favoriteSet = new Set(favoriteIds);

  const createLoteMutation = useMutation({
    mutationFn: (data: {
      title: string;
      price: number;
      size: number;
      amenities: string[];
      image: string;
      address?: string;
      lat: number;
      lng: number;
      description?: string;
    }) => {
      if (!token) throw new Error("No autenticado");
      return commercialApi.createLote(token, data);
    },
    onSuccess: (newLote) => {
      queryClient.setQueriesData({ queryKey: ["lotes"] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: [newLote, ...old.data],
        };
      });
    },
    onError: (err) => {
      setMutationError(err instanceof Error ? err.message : "Error inesperado");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
  });

  const updateLoteMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{
      title: string;
      price: number;
      size: number;
      amenities: string[];
      image: string;
      address?: string;
      lat: number;
      lng: number;
      description?: string;
    }> }) => {
      if (!token) throw new Error("No autenticado");
      return commercialApi.updateLote(token, id, data);
    },
    onSuccess: (updatedLote) => {
      queryClient.setQueriesData({ queryKey: ["lotes"] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((l: any) => (l.id === updatedLote.id ? updatedLote : l)),
        };
      });
    },
    onError: (err) => {
      setMutationError(err instanceof Error ? err.message : "Error inesperado");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
  });

  const deleteLoteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error("No autenticado");
      return commercialApi.deleteLote(token, id);
    },
    onMutate: async (loteId) => {
      await queryClient.cancelQueries({ queryKey: ["lotes"] });
      const previousData = queryClient.getQueriesData({ queryKey: ["lotes"] });

      queryClient.setQueriesData({ queryKey: ["lotes"] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((l: any) => l.id !== loteId),
        };
      });

      return { previousData };
    },
    onError: (err, _loteId, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, value]: [unknown, unknown]) => {
          queryClient.setQueryData(key, value);
        });
      }
      setMutationError(err instanceof Error ? err.message : "Error inesperado");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lotes"] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ loteId, action }: { loteId: number; action: "add" | "remove" }) => {
      if (!token) throw new Error("No autenticado");
      if (action === "add") {
        return commercialApi.addFavorito(token, loteId);
      }
      await commercialApi.removeFavorito(token, loteId);
      return null;
    },
    onMutate: async ({ loteId, action }) => {
      await queryClient.cancelQueries({ queryKey: ["favoritos"] });
      const previous = queryClient.getQueryData<number[]>(["favoritos"]);

      queryClient.setQueryData<number[]>(["favoritos"], (old = []) => {
        if (action === "remove") {
          return old.filter((id) => id !== loteId);
        }
        return old.includes(loteId) ? old : [...old, loteId];
      });

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["favoritos"], context.previous);
      }
      setFavoriteError(err instanceof Error ? err.message : "No se pudo actualizar favoritos");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favoritos"] });
    },
  });

  const isSaving = createLoteMutation.isPending || updateLoteMutation.isPending;

  useEffect(() => {
    if (!lotesResponse?.meta) return;
    setMeta(lotesResponse.meta);
  }, [lotesResponse?.meta]);

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
    const action = favoriteSet.has(lote.id) ? "remove" : "add";
    toggleFavoriteMutation.mutate({ loteId: lote.id, action });
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
      amenities: lote.amenities,
      image: lote.image,
      address: lote.address || "",
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

    setMutationError("");

    const latValue = Number(formState.lat);
    const lngValue = Number(formState.lng);

    if (!Number.isFinite(latValue) || !Number.isFinite(lngValue)) {
      setMutationError("Selecciona una direccion valida para el lote.");
      return;
    }

    const priceValue = Number(formState.price);
    const sizeValue = Number(formState.size);

    if (!formState.title.trim() || !Number.isFinite(priceValue) || priceValue <= 0 || !Number.isFinite(sizeValue) || sizeValue <= 0) {
      setMutationError("Completa titulo, precio y superficie con valores validos.");
      return;
    }

    const payload = {
      title: formState.title.trim(),
      price: priceValue,
      size: sizeValue,
      description: formState.description.trim() || undefined,
      amenities: formState.amenities,
      image: formState.image.trim(),
      address: formState.address.trim() || undefined,
      lat: latValue,
      lng: lngValue,
    };

    if (editingLoteId === null) {
      await createLoteMutation.mutateAsync(payload);
    } else {
      await updateLoteMutation.mutateAsync({ id: editingLoteId, data: payload });
    }
    closeModal();
  };

  const removeLote = async (loteId: number) => {
    if (!token || !canDeleteLotes) return;
    const confirmed = window.confirm("Se eliminara el lote seleccionado. Esta accion no se puede deshacer.");
    if (!confirmed) return;

    setMutationError("");
    await deleteLoteMutation.mutateAsync(loteId);
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

        {isLoading && (
          <SectionLoading
            title="Cargando lotes"
            message="Estamos consultando el listado disponible para mostrarte las opciones activas."
          />
        )}
        {!isLoading && error && (
          <SectionError
            title="No pudimos cargar los lotes"
            message={error instanceof Error ? error.message : "No se pudo cargar lotes"}
          />
        )}
        {mutationError && <p className="text-center text-red-300">{mutationError}</p>}
        {favoriteError && <p className="text-center text-amber-300">{favoriteError}</p>}
        {compareError && <p className="text-center text-amber-300">{compareError}</p>}

        {!isLoading && !error && lotes.length === 0 && (
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

        {!isLoading && !error && lotes.length > 0 && (
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
                    className={`btn ${favoriteSet.has(lote.id) ? "btn-outline" : "btn-primary"} flex-1 text-sm`}
                    onClick={() => void toggleFavorite(lote)}
                    disabled={!canManageFavorites || favoritesLoading || toggleFavoriteMutation.isPending}
                  >
                    {favoriteSet.has(lote.id) ? "Quitar favorito" : "Guardar favorito"}
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

            <form className="grid gap-6" onSubmit={submitLote}>
              <section className="grid gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Informacion basica
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-1">
                    <label htmlFor="lote-title" className="text-sm text-[var(--color-text-muted)]">
                      Nombre del lote
                    </label>
                    <input
                      id="lote-title"
                      className="field"
                      value={formState.title}
                      onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="lote-price" className="text-sm text-[var(--color-text-muted)]">
                      Precio (USD)
                    </label>
                    <input
                      id="lote-price"
                      className="field"
                      type="number"
                      min={1}
                      value={formState.price}
                      onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="lote-size" className="text-sm text-[var(--color-text-muted)]">
                      Superficie
                    </label>
                    <input
                      id="lote-size"
                      className="field"
                      type="number"
                      min={1}
                      value={formState.size}
                      onChange={(e) => setFormState((prev) => ({ ...prev, size: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor="lote-image" className="text-sm text-[var(--color-text-muted)]">
                      Imagen (URL)
                    </label>
                    <input
                      id="lote-image"
                      className="field"
                      value={formState.image}
                      onChange={(e) => setFormState((prev) => ({ ...prev, image: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="grid gap-1 md:col-span-2">
                    <label htmlFor="lote-description" className="text-sm text-[var(--color-text-muted)]">
                      Descripcion
                    </label>
                    <textarea
                      id="lote-description"
                      className="field"
                      rows={4}
                      value={formState.description}
                      onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              </section>

              <section className="grid gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Ubicacion
                </p>
                <div className="grid gap-2">
                  <label className="text-sm text-[var(--color-text-muted)]">Direccion</label>
                  <AddressAutocomplete
                    value={formState.address}
                    onChange={(value) => setFormState((prev) => ({ ...prev, address: value }))}
                    onSelect={({ address, lat, lng }) =>
                      setFormState((prev) => ({
                        ...prev,
                        address,
                        lat: String(lat),
                        lng: String(lng),
                      }))
                    }
                  />
                </div>
                {Number.isFinite(Number(formState.lat)) && Number.isFinite(Number(formState.lng)) && (
                  <MapView
                    lote={{
                      id: 0,
                      title: formState.title || "Nuevo lote",
                      price: Number(formState.price) || 0,
                      size: Number(formState.size) || 0,
                      amenities: formState.amenities,
                      image: formState.image || "",
                      lat: Number(formState.lat),
                      lng: Number(formState.lng),
                      address: formState.address || null,
                      description: formState.description || "",
                    }}
                  />
                )}
              </section>

              <section className="grid gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Caracteristicas
                </p>
                <AmenitiesSelector
                  options={allAmenities}
                  value={formState.amenities}
                  onChange={(amenities) => setFormState((prev) => ({ ...prev, amenities }))}
                />
              </section>

              {mutationError && <p className="text-sm text-red-300">{mutationError}</p>}

              <div className="flex flex-wrap gap-2 justify-end">
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
