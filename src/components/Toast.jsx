import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 animate-slide-up">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border backdrop-blur-md ${
        type === 'success' 
          ? 'bg-white/90 dark:bg-neutral-900/90 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
          : 'bg-white/90 dark:bg-neutral-900/90 border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400'
      }`}>
        {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
        <p className="text-sm font-medium text-slate-700 dark:text-neutral-200 pr-2">{message}</p>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors ml-2"
        >
          <X size={14} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}
