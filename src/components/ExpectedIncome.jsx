import { useState } from 'react';
import { TrendingUp, Plus, Trash2, DollarSign, Calendar } from 'lucide-react';

export function ExpectedIncome({ income, onAdd, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [newIncome, setNewIncome] = useState({ source: '', amount: '', date: new Date().toISOString().slice(0, 10) });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newIncome.source || !newIncome.amount) return;
    onAdd(newIncome);
    setNewIncome({ source: '', amount: '', date: new Date().toISOString().slice(0, 10) });
    setIsAdding(false);
  };

  const filteredIncome = income.filter(item => {
    if (!item.date) return true;
    return item.date.startsWith(selectedMonth);
  });

  const totalIncome = filteredIncome.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-50 dark:border-neutral-800">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 md:p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-500 dark:text-emerald-400">
              <TrendingUp size={20} className="md:w-6 md:h-6" />
            </div>
            Ingresos Esperados
          </h2>
          <p className="text-sm text-slate-400 dark:text-neutral-500 font-medium mt-2 ml-1">
            Total esperado ({selectedMonth}): <span className="text-emerald-500 font-bold">${totalIncome.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-auto">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 px-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 font-medium"
            />
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-full sm:w-auto text-sm bg-slate-900 dark:bg-neutral-800 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 dark:hover:bg-neutral-700 font-medium transition-all shadow-lg shadow-slate-200 dark:shadow-none hover:shadow-xl hover:shadow-slate-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isAdding ? 'Cancelar' : <><Plus size={18} /> Nuevo Ingreso</>}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 dark:bg-neutral-800/50 rounded-3xl border border-slate-100 dark:border-neutral-700 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Fuente (ej. Salario, Freelance)"
              value={newIncome.source}
              onChange={e => setNewIncome({...newIncome, source: e.target.value})}
              className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            <input
              type="number"
              placeholder="Monto esperado"
              value={newIncome.amount}
              onChange={e => setNewIncome({...newIncome, amount: e.target.value})}
              className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            <input
              type="date"
              value={newIncome.date}
              onChange={e => setNewIncome({...newIncome, date: e.target.value})}
              className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 outline-none transition-all font-medium text-slate-800 dark:text-white"
              required
            />
          </div>
          <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl hover:bg-emerald-600 font-medium transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 hover:shadow-xl hover:shadow-emerald-300 transform hover:-translate-y-0.5">
            Registrar Ingreso
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIncome.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-neutral-600">
            <div className="w-16 h-16 bg-slate-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={24} className="text-slate-300 dark:text-neutral-600" />
            </div>
            <p className="font-medium">¡Sin ingresos esperados para este mes!</p>
          </div>
        ) : (
          filteredIncome.map(item => (
            <div key={item.id} className="border border-slate-50 dark:border-neutral-800 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 bg-white dark:bg-neutral-900 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button onClick={() => onDelete(item.id)} className="text-slate-300 dark:text-neutral-600 hover:text-emerald-400 dark:hover:text-emerald-400 transition-colors bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg">{item.source}</h3>
                <p className="text-2xl font-bold text-emerald-500 mt-2">${item.amount.toFixed(2)}</p>
                {item.date && <p className="text-xs text-slate-400 mt-1">{new Date(item.date).toLocaleDateString()}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
