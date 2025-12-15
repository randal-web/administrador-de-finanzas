import { useState } from 'react';
import { Calendar, Plus, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function Subscriptions({ subscriptions, onAdd, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', amount: '', dueDay: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSub.name || !newSub.amount || !newSub.dueDay) return;
    
    // Validate day is between 1 and 31
    const day = parseInt(newSub.dueDay);
    if (day < 1 || day > 31) return;

    onAdd(newSub);
    setNewSub({ name: '', amount: '', dueDay: '' });
    setIsAdding(false);
  };

  const getDaysRemaining = (dueDay) => {
    const today = new Date();
    const currentDay = today.getDate();
    
    if (dueDay >= currentDay) {
      return dueDay - currentDay;
    } else {
      // Get days in current month to calculate days until next month's due date
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      return (daysInMonth - currentDay) + dueDay;
    }
  };

  const getStatusColor = (daysRemaining) => {
    if (daysRemaining <= 3) return 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20';
    if (daysRemaining <= 7) return 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    return 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
  };

  const getStatusText = (daysRemaining) => {
    if (daysRemaining === 0) return 'Vence hoy';
    if (daysRemaining === 1) return 'Vence mañana';
    return `Vence en ${daysRemaining} días`;
  };

  // Sort subscriptions by days remaining
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    return getDaysRemaining(a.dueDay) - getDaysRemaining(b.dueDay);
  });

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-50 dark:border-neutral-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 md:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-2xl text-purple-500 dark:text-purple-400">
              <Calendar size={20} className="md:w-6 md:h-6" />
            </div>
            Suscripciones y Pagos
          </h2>
          <p className="text-sm text-slate-400 dark:text-neutral-500 font-medium mt-2 ml-1">Controla tus gastos recurrentes y vencimientos</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-full md:w-auto text-sm bg-slate-900 dark:bg-neutral-800 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 dark:hover:bg-neutral-700 font-medium transition-all shadow-lg shadow-slate-200 dark:shadow-none hover:shadow-xl hover:shadow-slate-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          {isAdding ? 'Cancelar' : <><Plus size={18} /> Nuevo Pago</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 dark:bg-neutral-800/50 rounded-3xl border border-slate-100 dark:border-neutral-700 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre (ej. Netflix, Alquiler)"
              value={newSub.name}
              onChange={e => setNewSub({...newSub, name: e.target.value})}
              className="p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            <input
              type="number"
              placeholder="Monto mensual"
              value={newSub.amount}
              onChange={e => setNewSub({...newSub, amount: e.target.value})}
              className="p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            <div className="relative">
              <input
                type="number"
                placeholder="Día de pago (1-31)"
                value={newSub.dueDay}
                onChange={e => setNewSub({...newSub, dueDay: e.target.value})}
                min="1"
                max="31"
                className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
                required
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-purple-500 text-white py-4 rounded-2xl hover:bg-purple-600 font-medium transition-all shadow-lg shadow-purple-200 dark:shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-300 transform hover:-translate-y-0.5">
            Guardar Recordatorio
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSubscriptions.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-neutral-600">
            <div className="w-16 h-16 bg-slate-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <Clock size={24} className="text-slate-300 dark:text-neutral-600" />
            </div>
            <p className="font-medium">No tienes pagos recurrentes registrados</p>
          </div>
        ) : (
          sortedSubscriptions.map(sub => {
            const daysRemaining = getDaysRemaining(sub.dueDay);
            const statusColor = getStatusColor(daysRemaining);
            
            return (
              <div key={sub.id} className="border border-slate-50 dark:border-neutral-800 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 bg-white dark:bg-neutral-900 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <button onClick={() => onDelete(sub.id)} className="text-slate-300 dark:text-neutral-600 hover:text-rose-400 dark:hover:text-rose-400 transition-colors bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20">
                    <Trash2 size={18} />
                  </button>
                </div>
  
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">{sub.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium mt-1">Día {sub.dueDay} de cada mes</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-slate-700 dark:text-neutral-200">${sub.amount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${statusColor} transition-colors`}>
                  {daysRemaining <= 3 ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  <span className="text-sm font-bold">{getStatusText(daysRemaining)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
