import { X, AlertTriangle } from 'lucide-react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", cancelText = "Cancelar", type = "info" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 dark:border-neutral-800 overflow-hidden animate-scale-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${
              type === 'danger' 
                ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' 
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
            }`}>
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-neutral-800/50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium text-white shadow-lg shadow-slate-200 dark:shadow-none transform active:scale-95 transition-all ${
              type === 'danger'
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 dark:shadow-rose-900/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-indigo-900/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
