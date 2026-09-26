import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export function Input({ label, hint, leftIcon, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={inputId} className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leftIcon ? (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{leftIcon}</span>
        ) : null}
        <input
          id={inputId}
          {...props}
          className={`w-full ${leftIcon ? 'pl-10' : 'px-3'} pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        />
      </div>
      {hint ? <p className="text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}
