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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Target className="text-blue-600" />
          Metas Financieras
        </h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 font-medium transition-colors"
        >
          {isAdding ? 'Cancelar' : '+ Nueva Meta'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Nombre de la meta"
              value={newGoal.name}
              onChange={e => setNewGoal({...newGoal, name: e.target.value})}
              className="p-2 border rounded bg-white"
              required
            />
            <input
              type="number"
              placeholder="Monto objetivo"
              value={newGoal.targetAmount}
              onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})}
              className="p-2 border rounded bg-white"
              required
            />
            <input
              type="number"
              placeholder="Ahorro actual (opcional)"
              value={newGoal.currentAmount}
              onChange={e => setNewGoal({...newGoal, currentAmount: e.target.value})}
              className="p-2 border rounded bg-white"
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Guardar Meta
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          
          return (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">{goal.name}</h3>
                <button onClick={() => onDelete(goal.id)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>${goal.currentAmount.toFixed(2)}</span>
                  <span>${goal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {editingId === goal.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="number"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      placeholder="Nuevo monto"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(goal.id)} className="text-green-600 hover:bg-green-50 p-1 rounded">
                      <Check size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingId(goal.id);
                      setEditAmount(goal.currentAmount);
                    }}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Edit2 size={12} /> Actualizar ahorro
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
