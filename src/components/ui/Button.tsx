import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--cms-accent)] hover:brightness-110 text-white shadow-md shadow-blue-600/20 border border-blue-500/20',
  secondary:
    'bg-[var(--cms-surface)] border border-[var(--cms-border)] text-[var(--cms-text)] hover:bg-[var(--cms-surface-muted)] shadow-sm',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 border border-rose-500/20',
  ghost:
    'bg-transparent text-[var(--cms-text-muted)] hover:bg-[var(--cms-surface-muted)] border border-transparent',
  success:
    'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 border border-emerald-500/20',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[11px] rounded-lg min-h-8',
  md: 'px-4 py-2.5 text-xs rounded-xl min-h-10',
  lg: 'px-5 py-3 text-sm rounded-xl min-h-11',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leftIcon,
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {leftIcon}
      <span>{loading ? 'Please wait...' : children}</span>
    </button>
  );
}
