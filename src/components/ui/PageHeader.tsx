import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}

export function PageHeader({ title, description, actions, eyebrow }: PageHeaderProps) {
  return (
    <div className="cms-panel px-5 py-4 sm:px-6 sm:py-5">
      <div className="cms-toolbar">
        <div className="min-w-0 space-y-1">
          {eyebrow ? (
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cms-accent)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="cms-page-title truncate">{title}</h2>
          {description ? <p className="cms-page-desc">{description}</p> : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
