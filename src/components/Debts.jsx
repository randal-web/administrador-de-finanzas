import { useState } from 'react';
import { CreditCard, Plus, Trash2, DollarSign, TrendingDown, Calendar } from 'lucide-react';

export function Debts({ debts, onAdd, onPay, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [newDebt, setNewDebt] = useState({ name: '', amount: '', date: new Date().toISOString().slice(0, 10), type: 'personal' });
  const [payingId, setPayingId] = useState(null);
  const [payAmount, setPayAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount) return;
    onAdd(newDebt);
    setNewDebt({ name: '', amount: '', date: new Date().toISOString().slice(0, 10), type: 'personal' });
    setIsAdding(false);
  };

  const handlePay = (id) => {
    if (!payAmount) return;
    onPay(id, payAmount);
    setPayingId(null);
    setPayAmount('');
  };

  const filteredDebts = debts.filter(debt => {
    if (showAll) return true;
    if (!debt.date) return true; // Show debts without date (legacy)
    return debt.date.startsWith(selectedMonth);
  });

  const totalDebt = filteredDebts.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-50 dark:border-neutral-800">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 md:p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-500 dark:text-rose-400">
              <CreditCard size={20} className="md:w-6 md:h-6" />
            </div>
            Control de Deudas
          </h2>
          <p className="text-sm text-slate-400 dark:text-neutral-500 font-medium mt-2 ml-1">
            Total acumulado ({showAll ? 'Histórico' : selectedMonth}): <span className="text-rose-500 font-bold">${totalDebt.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={() => setShowAll(!showAll)}
            className={`w-full sm:w-auto px-4 py-3 rounded-2xl font-medium transition-all ${
              showAll 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/20' 
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
            }`}
          >
            {showAll ? 'Viendo todas' : 'Ver todas'}
          </button>

          {!showAll && (
            <div className="relative w-full sm:w-auto">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 px-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 font-medium"
              />
            </div>
          )}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-full sm:w-auto text-sm bg-slate-900 dark:bg-neutral-800 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 dark:hover:bg-neutral-700 font-medium transition-all shadow-lg shadow-slate-200 dark:shadow-none hover:shadow-xl hover:shadow-slate-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isAdding ? 'Cancelar' : <><Plus size={18} /> Nueva Deuda</>}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 dark:bg-neutral-800/50 rounded-3xl border border-slate-100 dark:border-neutral-700 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre (ej. Tarjeta Visa, Préstamo)"
              value={newDebt.name}
              onChange={e => setNewDebt({...newDebt, name: e.target.value})}
              className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            <select
              value={newDebt.type}
              onChange={e => setNewDebt({...newDebt, type: e.target.value})}
              className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none transition-all font-medium text-slate-800 dark:text-white cursor-pointer"
            >
              <option value="personal">Personal</option>
              <option value="credit-card">Tarjeta de Crédito</option>
            </select>
            <input
              type="number"
              placeholder="Monto adeudado"
              value={newDebt.amount}
              onChange={e => setNewDebt({...newDebt, amount: e.target.value})}
              className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            <input
              type="date"
              value={newDebt.date}
              onChange={e => setNewDebt({...newDebt, date: e.target.value})}
              className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none transition-all font-medium text-slate-800 dark:text-white"
              required
            />
          </div>
          <button type="submit" className="w-full bg-rose-500 text-white py-4 rounded-2xl hover:bg-rose-600 font-medium transition-all shadow-lg shadow-rose-200 dark:shadow-rose-900/20 hover:shadow-xl hover:shadow-rose-300 transform hover:-translate-y-0.5">
            Registrar Deuda
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDebts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-neutral-600">
            <div className="w-16 h-16 bg-slate-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <TrendingDown size={24} className="text-slate-300 dark:text-neutral-600" />
            </div>
            <p className="font-medium">¡Libre de deudas este mes!</p>
          </div>
        ) : (
          filteredDebts.map(debt => (
            <div key={debt.id} className="border border-slate-50 dark:border-neutral-800 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 bg-white dark:bg-neutral-900 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button onClick={() => onDelete(debt.id)} className="text-slate-300 dark:text-neutral-600 hover:text-rose-400 dark:hover:text-rose-400 transition-colors bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{debt.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    debt.type === 'credit-card' 
                      ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                      : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}>
                    {debt.type === 'credit-card' ? 'Tarjeta' : 'Personal'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-rose-500 mt-2">${debt.amount.toFixed(2)}</p>
                {debt.date && <p className="text-xs text-slate-400 mt-1">{new Date(debt.date).toLocaleDateString()}</p>}
              </div>

              {payingId === debt.id ? (
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-neutral-800 p-2 rounded-2xl">
                  <input
                    type="number"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-neutral-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none font-medium text-slate-800 dark:text-white"
                    placeholder="Monto a pagar"
                    autoFocus
                  />
                  <button onClick={() => handlePay(debt.id)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-xl transition-colors">
                    <DollarSign size={20} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setPayingId(debt.id);
                    setPayAmount('');
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <DollarSign size={16} /> Abonar a Deuda
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
