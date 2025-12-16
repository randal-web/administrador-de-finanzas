import { Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export function History({ transactions, onDelete }) {
  return (
    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-50 dark:border-neutral-800 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Historial Reciente</h2>
        <p className="text-sm text-slate-400 dark:text-neutral-500 font-medium mt-1">Últimos movimientos registrados</p>
      </div>
      
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[400px]">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400 dark:text-neutral-600">
            <div className="w-16 h-16 bg-slate-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <ArrowUpCircle size={24} className="text-slate-300 dark:text-neutral-600" />
            </div>
            <p className="font-medium">No hay transacciones</p>
          </div>
        ) : (
          transactions.map((transaction, index) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                {transaction.type === 'income' ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-500 dark:text-emerald-400">
                    <ArrowUpCircle size={20} />
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-500 dark:text-rose-400">
                    <ArrowDownCircle size={20} />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-slate-700 dark:text-neutral-200">{transaction.category}</p>
                  <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium">
                    {new Date(transaction.date).toLocaleDateString()} 
                    {transaction.description && ` • ${transaction.description}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`font-bold text-sm ${
                  transaction.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="text-slate-300 dark:text-neutral-600 hover:text-rose-400 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-full"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
