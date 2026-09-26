import type { ReactNode } from 'react';

type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  success: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400',
  danger: 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400',
  info: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400',
};

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
