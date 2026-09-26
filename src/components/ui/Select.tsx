import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
  disabled?: boolean;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  triggerClassName?: string;
  size?: 'sm' | 'md';
  leftIcon?: ReactNode;
  disabled?: boolean;
  align?: 'left' | 'right';
};

type MenuCoords = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openUp: boolean;
};

export function Select({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select…',
  id,
  className = '',
  triggerClassName = '',
  size = 'md',
  leftIcon,
  disabled = false,
  align = 'left',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const autoId = useId();
  const selectId = id || autoId;
  const selected = options.find((o) => o.value === value);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 6;
    const preferredMax = 240;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 8;
    const spaceAbove = rect.top - gap - 8;
    const openUp = spaceBelow < 140 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(preferredMax, openUp ? spaceAbove : spaceBelow));
    const top = openUp ? Math.max(8, rect.top - gap - maxHeight) : rect.bottom + gap;

    setCoords({
      top,
      left: align === 'right' ? rect.right - rect.width : rect.left,
      width: rect.width,
      maxHeight,
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null);
      return;
    }
    updatePosition();
    const onReposition = () => updatePosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, align, options.length]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const sizeClasses =
    size === 'sm'
      ? 'min-h-8 px-2.5 py-1.5 text-xs gap-1.5'
      : 'min-h-10 px-3 py-2.5 text-xs gap-2';

  const menu =
    open && coords
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-labelledby={selectId}
            className="cms-select-menu"
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: coords.width,
              minWidth: coords.width,
              maxWidth: coords.width,
              zIndex: 100,
              maxHeight: coords.maxHeight,
            }}
          >
            <div className="overflow-y-auto p-1.5" style={{ maxHeight: coords.maxHeight }}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onClick={() => {
                      if (option.disabled) return;
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`cms-select-option ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    } ${option.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{option.label}</span>
                      {option.hint ? (
                        <span
                          className={`mt-0.5 block truncate text-[10px] ${
                            isSelected ? 'text-blue-100' : 'text-slate-400'
                          }`}
                        >
                          {option.hint}
                        </span>
                      ) : null}
                    </span>
                    {isSelected ? <Check className="h-3.5 w-3.5 shrink-0 text-blue-100" /> : null}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      {label ? (
        <label htmlFor={selectId} className="cms-label mb-1.5 block">
          {label}
        </label>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        id={selectId}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`cms-select-trigger ${sizeClasses} ${triggerClassName} ${
          open ? 'border-blue-400 ring-2 ring-blue-500/20' : ''
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {leftIcon ? <span className="shrink-0 text-slate-400">{leftIcon}</span> : null}
        <span
          className={`min-w-0 flex-1 truncate text-left ${
            selected ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'
          }`}
        >
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180 text-blue-500' : ''
          }`}
        />
      </button>

      {menu}
    </div>
  );
}
