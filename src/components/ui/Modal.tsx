import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
};

const sizeClass = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = 'lg',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog backdrop"
        className="absolute inset-0 cursor-pointer bg-slate-950/55 backdrop-blur-[3px] transition-opacity"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cms-modal-title"
        className={`relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/20 animate-in fade-in zoom-in-95 duration-150 sm:rounded-3xl dark:border-slate-700 dark:bg-slate-900 ${sizeClass[size]}`}
      >
        <div className="relative overflow-hidden border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-sky-50/40 dark:from-blue-950/40 dark:via-slate-900 dark:to-slate-900" />
          <div className="relative flex items-start gap-3">
            {icon ? (
              <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id="cms-modal-title" className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {title}
              </h2>
              {description ? (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-950/40 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
