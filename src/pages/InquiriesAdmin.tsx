import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import InquiriesTable from "../components/InquiriesTable";
import { useAuth } from "../context/useAuth";
import { useInquiries } from "../hooks/useInquiries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { commercialApi } from "../services/commercialApi";
import type { Inquiry } from "../types/commercial";

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

const InquiriesAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // La URL es la fuente de verdad del filtro de estado (link compartible y persistente).
  const statusParam = searchParams.get("status");
  const status = statusParam === "pending" || statusParam === "read" ? statusParam : undefined;

  const queryClient = useQueryClient();
  const { data, isLoading, error } = useInquiries(token, page, limit, status);
  const inquiries = data?.data ?? [];
  const meta = data?.meta ?? { page, limit, total: 0, totalPages: 1 };

  const pageItems = useMemo(() => buildPageItems(meta.page, meta.totalPages), [meta.page, meta.totalPages]);
  const queryKey = useMemo(() => ["inquiries", { page, limit, status }], [page, limit, status]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "pending" | "read" }) => {
      if (!token) throw new Error("No autenticado");
      return commercialApi.updateInquiryStatus(token, id, status);
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<{ data: Inquiry[]; meta: typeof meta }>(queryKey);

      queryClient.setQueryData<{ data: Inquiry[]; meta: typeof meta }>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item) => (item.id === id ? { ...item, status } : item)),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleMarkRead = (id: string) => {
    updateStatusMutation.mutate({ id, status: "read" });
  };

  const handleFilterChange = (nextStatus?: "pending" | "read") => {
    if (!nextStatus) {
      setSearchParams({});
    } else {
      setSearchParams({ status: nextStatus });
    }
    setPage(1);
  };

  return (
    <section className="page">
      <div className="container space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-primary)]">Consultas</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Panel administrativo de consultas recibidas.</p>
          </div>
          <button type="button" className="btn btn-outline text-sm" onClick={() => navigate("/dashboard")}>
            Volver al dashboard
          </button>
        </div>

        {isLoading && (
          <SectionLoading title="Cargando consultas" message="Estamos preparando el listado de consultas." />
        )}

        {!isLoading && error && (
          <SectionError
            title="No se pudieron cargar las consultas"
            message={error instanceof Error ? error.message : "Error inesperado"}
          />
        )}

        {!isLoading && !error && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className={`btn ${!status ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleFilterChange(undefined)}
              >
                Todas
              </button>
              <button
                type="button"
                className={`btn ${status === "pending" ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleFilterChange("pending")}
              >
                Pendientes
              </button>
              <button
                type="button"
                className={`btn ${status === "read" ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleFilterChange("read")}
              >
                Leidas
              </button>
            </div>
            {inquiries.length === 0 && (
              <SectionEmpty
                title={status ? "No hay consultas para este estado" : "No hay consultas todavia"}
                message={
                  status
                    ? "Proba con otro filtro para revisar el resto de las consultas."
                    : "Cuando los usuarios envien consultas apareceran aqui."
                }
              />
            )}
            {inquiries.length > 0 && (
              <>
                <div className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-[var(--color-text-muted)]">
                  <span>
                    Total: <strong className="text-white">{meta.total}</strong>
                  </span>
                  <span>
                    Pagina {meta.page} de {meta.totalPages}
                  </span>
                </div>
                <InquiriesTable
                  inquiries={inquiries}
                  onMarkRead={handleMarkRead}
                  updatingId={updateStatusMutation.isPending ? updateStatusMutation.variables?.id ?? null : null}
                />
              </>
            )}
          </>
        )}

        {meta.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              className="btn btn-outline"
              disabled={meta.page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </button>
            {pageItems.map((item, index) =>
              item === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-[var(--color-text-muted)]">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${item}`}
                  type="button"
                  className={`btn ${item === meta.page ? "btn-primary" : "btn-outline"}`}
                  aria-current={item === meta.page ? "page" : undefined}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              className="btn btn-outline"
              disabled={meta.page === meta.totalPages}
              onClick={() => setPage((prev) => Math.min(meta.totalPages, prev + 1))}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default InquiriesAdmin;
