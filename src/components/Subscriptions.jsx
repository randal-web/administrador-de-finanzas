import { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import { Calendar, Plus, Trash2, AlertCircle, CheckCircle2, Clock, X, History } from 'lucide-react';

export function Subscriptions({ subscriptions, onAdd, onDelete, onPay }) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [newSub, setNewSub] = useState({ 
    name: '', 
    amount: '', 
    dueDay: '', 
    frequency: 'monthly', // monthly, yearly, one-time
    date: '' // for yearly/one-time
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSub.name || !newSub.amount) return;
    
    if (newSub.frequency === 'monthly') {
      const day = parseInt(newSub.dueDay);
      if (day < 1 || day > 31) return;
    } else {
      if (!newSub.date) return;
    }

    onAdd(newSub);
    setNewSub({ name: '', amount: '', dueDay: '', frequency: 'monthly', date: '' });
    setIsAdding(false);
  };

  const isPaidCurrentCycle = (sub) => {
    if (!sub.lastPaymentDate) return false;
    
    const lastPayment = new Date(sub.lastPaymentDate);
    const today = new Date();
    
    if (sub.frequency === 'monthly' || !sub.frequency) {
      return lastPayment.getMonth() === today.getMonth() && 
             lastPayment.getFullYear() === today.getFullYear();
    } else if (sub.frequency === 'yearly') {
      return lastPayment.getFullYear() === today.getFullYear();
    }
    return false;
  };

  const getDaysRemaining = (sub) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPaid = isPaidCurrentCycle(sub);
    
    if (sub.frequency === 'monthly' || !sub.frequency) {
      const dueDay = parseInt(sub.dueDay);
      const currentDay = today.getDate();
      
      if (dueDay >= currentDay) {
        return dueDay - currentDay;
      } else {
        // If the due date has passed for this month
        if (!isPaid) {
          // If not paid, it's OVERDUE. Return negative days.
          // e.g. Due 15th, Today 16th. 15 - 16 = -1 (1 day overdue)
          return dueDay - currentDay;
        }
        // If paid, show next month's due date (reset on 1st of month logic handled naturally by currentDay being 1)
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return (daysInMonth - currentDay) + dueDay;
      }
    } else if (sub.frequency === 'yearly') {
      const [year, month, day] = sub.date.split('-').map(Number);
      const targetDate = new Date(today.getFullYear(), month - 1, day);
      
      if (targetDate < today) {
        targetDate.setFullYear(today.getFullYear() + 1);
      }
      
      const diffTime = Math.abs(targetDate - today);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    } else if (sub.frequency === 'one-time') {
      const targetDate = new Date(sub.date);
      targetDate.setHours(0, 0, 0, 0);
      
      if (targetDate < today) return -1; // Expired
      
      const diffTime = Math.abs(targetDate - today);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const getStatusColor = (daysRemaining) => {
    if (daysRemaining < 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30';
    if (daysRemaining <= 3) return 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20';
    if (daysRemaining <= 7) return 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    return 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
  };

  const getStatusText = (daysRemaining) => {
    if (daysRemaining < 0) return `Vencido hace ${Math.abs(daysRemaining)} días`;
    if (daysRemaining === 0) return 'Vence hoy';
    if (daysRemaining === 1) return 'Vence mañana';
    return `Vence en ${daysRemaining} días`;
  };

  // Sort subscriptions by days remaining
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    return getDaysRemaining(a) - getDaysRemaining(b);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre (ej. Netflix, Seguro)"
              value={newSub.name}
              onChange={e => setNewSub({...newSub, name: e.target.value})}
              className="p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            <input
              type="number"
              placeholder="Monto"
              value={newSub.amount}
              onChange={e => setNewSub({...newSub, amount: e.target.value})}
              className="p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            
            <select
              value={newSub.frequency}
              onChange={e => setNewSub({...newSub, frequency: e.target.value})}
              className="p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all font-medium text-slate-800 dark:text-white"
            >
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
              <option value="one-time">Único</option>
            </select>

            {newSub.frequency === 'monthly' ? (
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
            ) : (
              <Flatpickr
                value={newSub.date}
                options={{ dateFormat: 'Y-m-d' }}
                onChange={([selected]) => setNewSub({ ...newSub, date: selected ? selected.toISOString().slice(0,10) : '' })}
                className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900 outline-none transition-all font-medium text-slate-800 dark:text-white"
                required
              />
            )}
          </div>
          <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-200 dark:shadow-none">
            Guardar Pago
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
            const daysRemaining = getDaysRemaining(sub);
            const statusColor = getStatusColor(daysRemaining);
            const isPaid = isPaidCurrentCycle(sub);
            
            let dateText = '';
            if (sub.frequency === 'monthly' || !sub.frequency) {
              dateText = `Día ${sub.dueDay} de cada mes`;
            } else if (sub.frequency === 'yearly') {
              const [year, month, day] = sub.date.split('-');
              const date = new Date(year, month - 1, day);
              dateText = `Anual: ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}`;
            } else {
              const date = new Date(sub.date);
              dateText = `Único: ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
            }
            
            return (
              <div 
                key={sub.id} 
                onClick={() => setSelectedSub(sub)}
                className="border border-slate-50 dark:border-neutral-800 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 bg-white dark:bg-neutral-900 group relative overflow-hidden cursor-pointer"
              >
                {isPaid && sub.frequency !== 'one-time' && (
                  <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl z-10">
                    {sub.frequency === 'monthly' ? 'PAGADO ESTE MES' : 'PAGADO ESTE AÑO'}
                  </div>
                )}
                
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(sub.id); }} 
                    className="text-slate-300 dark:text-neutral-600 hover:text-rose-400 dark:hover:text-rose-400 transition-colors bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20"
                   >
                    <Trash2 size={18} />
                  </button>
                </div>
  
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">{sub.name}</h3>
                    <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium mt-1">{dateText}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-slate-700 dark:text-neutral-200">${sub.amount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${statusColor} transition-colors mb-3`}>
                  {daysRemaining <= 3 ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                  <span className="text-sm font-bold">{getStatusText(daysRemaining)}</span>
                </div>

                {sub.status === 'paid' || isPaid ? (
                  <button 
                    disabled
                    className="w-full py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center justify-center gap-2 cursor-default"
                  >
                    <CheckCircle2 size={16} /> {sub.status === 'paid' ? 'Pagado' : 'Pagado (Ciclo Actual)'}
                  </button>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onPay && onPay(sub); }}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Registrar Pago
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* History Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={() => setSelectedSub(null)}>
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50 dark:border-neutral-800 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-50 dark:border-neutral-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">{selectedSub.name}</h3>
              <button onClick={() => setSelectedSub(null)} className="p-2 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Details */}
              <div className="flex justify-between items-center bg-slate-50 dark:bg-neutral-800/50 p-4 rounded-2xl">
                <div>
                  <p className="text-sm text-slate-400 dark:text-neutral-500">Monto</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">${selectedSub.amount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 dark:text-neutral-500">Frecuencia</p>
                  <p className="font-medium text-slate-800 dark:text-white capitalize">
                    {selectedSub.frequency === 'monthly' ? 'Mensual' : selectedSub.frequency === 'yearly' ? 'Anual' : 'Único'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              {!isPaidCurrentCycle(selectedSub) && selectedSub.status !== 'paid' && (
                <button 
                  onClick={() => {
                    onPay && onPay(selectedSub);
                    setSelectedSub(null);
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> Cerrar Pago (Registrar)
                </button>
              )}

              {/* History */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <History size={18} className="text-slate-400" /> Historial de Pagos
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedSub.payments && selectedSub.payments.length > 0 ? (
                    selectedSub.payments.map(payment => (
                      <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-neutral-800/50 rounded-xl border border-slate-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-slate-600 dark:text-neutral-300">
                          {new Date(payment.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ${payment.amount.toFixed(2)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400 dark:text-neutral-500 text-center py-4">No hay pagos registrados</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
