import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="cms-panel px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--cms-accent-soft)] text-[var(--cms-accent)] ring-8 ring-[color-mix(in_srgb,var(--cms-accent-soft)_70%,transparent)]">
        {icon}
      </div>
      <h3 className="cms-page-title justify-self-center">{title}</h3>
      <p className="cms-page-desc mx-auto mt-2">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
