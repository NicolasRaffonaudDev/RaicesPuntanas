import type { ReactNode } from "react";

interface SectionEmptyProps {
  title?: string;
  message: string;
  action?: ReactNode;
  compact?: boolean;
}

const SectionEmpty: React.FC<SectionEmptyProps> = ({
  title = "Sin resultados",
  message,
  action,
  compact = false,
}) => {
  return (
    <section
      className={`card border-[var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(18,18,18,0.96))] ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">{title}</p>
          <p className="text-sm leading-6 text-[var(--color-text-muted)]">{message}</p>
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
    </section>
  );
};

export default SectionEmpty;
