import { Bell, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getDaysRemaining } from '../lib/utils';

export function Notifications({ subscriptions, onClose }) {
  // Filter subscriptions due in the next 5 days
  const upcomingPayments = subscriptions
    .map(sub => ({
      ...sub,
      daysRemaining: getDaysRemaining(sub.dueDay)
    }))
    .filter(sub => sub.daysRemaining <= 5)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return (
    <div className="absolute top-16 right-4 md:right-8 w-80 md:w-96 bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgb(0,0,0,0.5)] border border-slate-100 dark:border-neutral-800 z-50 overflow-hidden animate-fade-in-down">
      <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex justify-between items-center bg-slate-50/50 dark:bg-neutral-800/30">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Bell size={18} className="text-indigo-500" />
          Notificaciones
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
          {upcomingPayments.length} nuevas
        </span>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {upcomingPayments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-neutral-500">
            <CheckCircle2 size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">¡Todo al día!</p>
            <p className="text-xs mt-1">No tienes pagos próximos en los siguientes 5 días.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-neutral-800">
            {upcomingPayments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl shrink-0 ${
                    payment.daysRemaining <= 1 
                      ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500' 
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'
                  }`}>
                    <AlertCircle size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 dark:text-white truncate">
                      {payment.name}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-neutral-400 mt-0.5">
                      Vence {payment.daysRemaining === 0 ? 'hoy' : payment.daysRemaining === 1 ? 'mañana' : `en ${payment.daysRemaining} días`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-slate-700 dark:text-neutral-200">
                      ${payment.amount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 bg-slate-50 dark:bg-neutral-800/30 border-t border-slate-100 dark:border-neutral-800 text-center">
        <button 
          onClick={onClose}
          className="text-xs font-medium text-slate-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Cerrar notificaciones
        </button>
      </div>
    </div>
  );
}