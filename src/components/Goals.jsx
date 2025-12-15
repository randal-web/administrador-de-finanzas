import { useState } from 'react';
import { Target, Plus, Trash2, Edit2, Check } from 'lucide-react';

export function Goals({ goals, onAdd, onUpdate, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', currentAmount: '' });
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount) return;
    
    onAdd(newGoal);
    setNewGoal({ name: '', targetAmount: '', currentAmount: '' });
    setIsAdding(false);
  };

  const handleUpdate = (id) => {
    if (editAmount === '') return;
    onUpdate(id, editAmount);
    setEditingId(null);
    setEditAmount('');
  };

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-50 dark:border-neutral-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-500 dark:text-blue-400">
              <Target size={20} className="md:w-6 md:h-6" />
            </div>
            Metas Financieras
          </h2>
          <p className="text-sm text-slate-400 dark:text-neutral-500 font-medium mt-2 ml-1">Define y rastrea tus objetivos de ahorro</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-full md:w-auto text-sm bg-slate-900 dark:bg-neutral-800 text-white px-5 py-3 rounded-2xl hover:bg-slate-800 dark:hover:bg-neutral-700 font-medium transition-all shadow-lg shadow-slate-200 dark:shadow-none hover:shadow-xl hover:shadow-slate-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          {isAdding ? 'Cancelar' : <><Plus size={18} /> Nueva Meta</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-slate-50 dark:bg-neutral-800/50 rounded-3xl border border-slate-100 dark:border-neutral-700 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre de la meta"
              value={newGoal.name}
              onChange={e => setNewGoal({...newGoal, name: e.target.value})}
              className="p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            <input
              type="number"
              placeholder="Monto objetivo"
              value={newGoal.targetAmount}
              onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
              className="p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
            <input
              type="number"
              placeholder="Ahorro actual (opcional)"
              value={newGoal.currentAmount}
              onChange={e => setNewGoal({...newGoal, currentAmount: e.target.value})}
              className="p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-4 rounded-2xl hover:bg-blue-600 font-medium transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-xl hover:shadow-blue-300 transform hover:-translate-y-0.5">
            Guardar Meta
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <div key={goal.id} className="border border-slate-50 dark:border-neutral-800 rounded-3xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 bg-white dark:bg-neutral-900 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                 <button onClick={() => onDelete(goal.id)} className="text-slate-300 dark:text-neutral-600 hover:text-rose-400 dark:hover:text-rose-400 transition-colors bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg">{goal.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium mt-1">Objetivo: ${goal.targetAmount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-500 dark:text-blue-400">${goal.currentAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="w-full bg-slate-100 dark:bg-neutral-800 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_2px_10px_rgb(59,130,246,0.4)]" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-xs font-bold text-blue-500 dark:text-blue-400">{progress.toFixed(0)}% completado</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editingId === goal.id ? (
                  <div className="flex items-center gap-2 w-full bg-slate-50 dark:bg-neutral-800 p-2 rounded-2xl">
                    <input
                      type="number"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-neutral-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none font-medium text-slate-800 dark:text-white"
                      placeholder="Nuevo monto"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(goal.id)} className="text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 p-2 rounded-xl transition-colors">
                      <Check size={20} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingId(goal.id);
                      setEditAmount(goal.currentAmount);
                    }}
                    className="w-full py-3 rounded-2xl bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                  >
                    <Edit2 size={16} /> Actualizar ahorro
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
