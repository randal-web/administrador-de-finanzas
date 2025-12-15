import { useState } from 'react';
import { PlusCircle, CheckCircle2 } from 'lucide-react';

export function TransactionForm({ onAdd }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;

    onAdd({
      type,
      amount,
      category,
      description,
      date: new Date().toISOString()
    });

    setAmount('');
    setCategory('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-2xl">
        <div 
          className={`absolute top-1 bottom-1 rounded-xl bg-white dark:bg-neutral-700 shadow-sm ring-1 ring-slate-200 dark:ring-neutral-600 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${
            type === 'income' ? 'left-1 right-1/2' : 'left-1/2 right-1'
          }`}
        />
        <button
          type="button"
          onClick={() => setType('income')}
          className={`relative z-10 flex-1 py-3 rounded-xl font-medium text-sm transition-colors duration-200 ${
            type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
          }`}
        >
          Ingreso
        </button>
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`relative z-10 flex-1 py-3 rounded-xl font-medium text-sm transition-colors duration-200 ${
            type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
          }`}
        >
          Egreso
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Monto</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500 font-medium">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-neutral-900 focus:border-slate-200 dark:focus:border-neutral-700 focus:ring-4 focus:ring-slate-100 dark:focus:ring-neutral-800 transition-all outline-none font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Categoría</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-neutral-900 focus:border-slate-200 dark:focus:border-neutral-700 focus:ring-4 focus:ring-slate-100 dark:focus:ring-neutral-800 transition-all outline-none font-medium text-slate-800 dark:text-white appearance-none cursor-pointer"
              required
            >
              <option value="">Seleccionar categoría</option>
              {type === 'income' ? (
                <>
                  <option value="Salario">Salario</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Inversiones">Inversiones</option>
                  <option value="Regalo">Regalo</option>
                  <option value="Otro">Otro</option>
                </>
              ) : (
                <>
                  <option value="Alimentación">Alimentación</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Vivienda">Vivienda</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Salud">Salud</option>
                  <option value="Educación">Educación</option>
                  <option value="Ahorro">Ahorro</option>
                  <option value="Inversión">Inversión</option>
                  <option value="Otro">Otro</option>
                </>
              )}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-800 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-neutral-900 focus:border-slate-200 dark:focus:border-neutral-700 focus:ring-4 focus:ring-slate-100 dark:focus:ring-neutral-800 transition-all outline-none font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500"
            placeholder="Detalles opcionales..."
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-slate-900 dark:bg-neutral-800 text-white py-4 rounded-2xl hover:bg-slate-800 dark:hover:bg-neutral-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg shadow-slate-200 dark:shadow-none hover:shadow-xl hover:shadow-slate-300 transform hover:-translate-y-0.5"
      >
        <CheckCircle2 size={20} />
        Guardar Transacción
      </button>
    </form>
  );
}
