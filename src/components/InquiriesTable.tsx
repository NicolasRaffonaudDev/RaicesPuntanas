import type { Inquiry } from "../types/commercial";

interface InquiriesTableProps {
  inquiries: Inquiry[];
  onMarkRead: (id: string) => void;
  updatingId: string | null;
}

const formatDate = (value: string) => new Date(value).toLocaleString("es-AR");

const InquiriesTable: React.FC<InquiriesTableProps> = ({ inquiries, onMarkRead, updatingId }) => (
  <div className="card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--color-surface-alt)] text-xs uppercase text-[var(--color-text-muted)]">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Mensaje</th>
            <th className="px-4 py-3">Lote</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3 text-right">Accion</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} className="border-t border-[var(--color-border)]">
              <td className="px-4 py-4 text-sm font-semibold text-white">{inquiry.name}</td>
              <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">{inquiry.email}</td>
              <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">
                <span className="line-clamp-3 block max-w-[360px]">{inquiry.message}</span>
              </td>
              <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">
                {inquiry.lote?.title ?? `Lote #${inquiry.loteId}`}
                {inquiry.lote?.address ? ` (${inquiry.lote.address})` : ""}
              </td>
              <td className="px-4 py-4 text-sm">
                <span
                  className={`rounded-full border px-2 py-1 text-xs ${
                    inquiry.status === "read"
                      ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                      : "border-amber-400/40 bg-amber-500/15 text-amber-200"
                  }`}
                >
                  {inquiry.status === "read" ? "Leido" : "Pendiente"}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">{formatDate(inquiry.createdAt)}</td>
              <td className="px-4 py-4 text-right">
                {inquiry.status === "pending" && (
                  <button
                    type="button"
                    className="btn btn-outline text-xs"
                    disabled={updatingId === inquiry.id}
                    onClick={() => onMarkRead(inquiry.id)}
                  >
                    {updatingId === inquiry.id ? "Actualizando..." : "Marcar como leido"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default InquiriesTable;
