import type { ReactNode } from "react";

interface SectionErrorProps {
  title?: string;
  message: string;
  action?: ReactNode;
  compact?: boolean;
}

const SectionError: React.FC<SectionErrorProps> = ({
  title = "No pudimos cargar esta seccion",
  message,
  action,
  compact = false,
}) => {
  return (
    <section
      className={`card border-red-800 bg-[linear-gradient(180deg,rgba(127,29,29,0.28),rgba(18,18,18,0.96))] ${
        compact ? "p-4" : "p-6"
      }`}
      role="alert"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-300">{title}</p>
          <p className="text-sm leading-6 text-red-100">{message}</p>
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
    </section>
  );
};

export default SectionError;
