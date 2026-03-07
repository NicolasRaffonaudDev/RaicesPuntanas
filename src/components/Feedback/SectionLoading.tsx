interface SectionLoadingProps {
  title?: string;
  message?: string;
  compact?: boolean;
}

const SectionLoading: React.FC<SectionLoadingProps> = ({
  title = "Cargando contenido",
  message = "Estamos preparando la informacion para esta seccion.",
  compact = false,
}) => {
  return (
    <section
      className={`card border-[var(--color-primary)]/20 bg-[linear-gradient(180deg,rgba(255,215,0,0.06),rgba(18,18,18,0.96))] ${
        compact ? "p-4" : "p-6"
      }`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-start gap-4">
        <div
          className="mt-1 h-3 w-3 rounded-full bg-[var(--color-primary)] shadow-[0_0_16px_rgba(255,215,0,0.55)]"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">{title}</p>
          <p className="text-sm leading-6 text-[var(--color-text-muted)]">{message}</p>
        </div>
      </div>
    </section>
  );
};

export default SectionLoading;
