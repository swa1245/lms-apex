import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import type { ToastMessage } from '../../types';

interface ToastProps {
  message: ToastMessage;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  const icon =
    message.type === 'success' ? (
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    ) : message.type === 'danger' ? (
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
    ) : message.type === 'warning' ? (
      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
    ) : (
      <Info className="w-5 h-5 text-sky-400 shrink-0" />
    );

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900 text-white px-4 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 max-w-md">
        {icon}
        <div className="flex-1 text-xs">
          <h4 className="font-bold text-white">{message.title}</h4>
          <p className="text-slate-300 text-[11px] mt-0.5">{message.desc}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
