import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionEmpty, SectionError, SectionLoading } from "../components/Feedback";
import InquiriesTable from "../components/InquiriesTable";
import { useAuth } from "../context/useAuth";
import { useInquiries } from "../hooks/useInquiries";

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
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error } = useInquiries(token, page, limit);
  const inquiries = data?.data ?? [];
  const meta = data?.meta ?? { page, limit, total: 0, totalPages: 1 };

  const pageItems = useMemo(() => buildPageItems(meta.page, meta.totalPages), [meta.page, meta.totalPages]);

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

        {!isLoading && !error && inquiries.length === 0 && (
          <SectionEmpty
            title="No hay consultas todavia"
            message="Cuando los usuarios envien consultas apareceran aqui."
          />
        )}

        {!isLoading && !error && inquiries.length > 0 && (
          <>
            <div className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-[var(--color-text-muted)]">
              <span>
                Total: <strong className="text-white">{meta.total}</strong>
              </span>
              <span>
                Pagina {meta.page} de {meta.totalPages}
              </span>
            </div>
            <InquiriesTable inquiries={inquiries} />
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
