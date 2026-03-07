import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  meta,
  actions,
  compact = false,
}) => {
  return (
    <header
      className={`rounded-[1.15rem] border border-[rgba(212,175,55,0.16)] bg-[linear-gradient(135deg,rgba(212,175,55,0.1),rgba(18,18,18,0.96)_42%,rgba(18,18,18,0.98)_100%)] shadow-[0_18px_44px_rgba(0,0,0,0.24)] ${
        compact ? "p-5" : "p-6"
      }`}
    >
      <div className={`flex flex-col gap-5 ${actions ? "xl:flex-row xl:items-start xl:justify-between" : ""}`}>
        <div className={`min-w-0 ${compact ? "max-w-3xl space-y-3" : "max-w-4xl space-y-4"}`}>
          {eyebrow ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              {eyebrow}
            </p>
          ) : null}

          <div className="space-y-2">
            <h1 className={`${compact ? "text-3xl" : "text-4xl"} font-semibold tracking-tight text-white`}>{title}</h1>
            {description ? (
              <p className="max-w-3xl text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
            ) : null}
          </div>

          {meta ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">{meta}</div>
          ) : null}
        </div>

        {actions ? (
          <div className={`grid w-full gap-2 ${compact ? "lg:w-[22rem]" : "lg:w-[24rem]"}`}>{actions}</div>
        ) : null}
      </div>
    </header>
  );
};

export default PageHeader;
