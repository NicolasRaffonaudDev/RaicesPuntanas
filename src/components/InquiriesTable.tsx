import type { Inquiry } from "../types/commercial";

interface InquiriesTableProps {
  inquiries: Inquiry[];
}

const formatDate = (value: string) => new Date(value).toLocaleString("es-AR");

const InquiriesTable: React.FC<InquiriesTableProps> = ({ inquiries }) => (
  <div className="card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--color-surface-alt)] text-xs uppercase text-[var(--color-text-muted)]">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Mensaje</th>
            <th className="px-4 py-3">Lote</th>
            <th className="px-4 py-3">Fecha</th>
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
              <td className="px-4 py-4 text-sm text-[var(--color-text-muted)]">{formatDate(inquiry.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default InquiriesTable;
