import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Nueva Transacción</h2>
      
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 rounded-md font-medium transition-colors ${
            type === 'income' 
              ? 'bg-green-100 text-green-700 border-2 border-green-500' 
              : 'bg-gray-50 text-gray-600 border border-gray-200'
          }`}
        >
          Ingreso
        </button>
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 rounded-md font-medium transition-colors ${
            type === 'expense' 
              ? 'bg-red-100 text-red-700 border-2 border-red-500' 
              : 'bg-gray-50 text-gray-600 border border-gray-200'
          }`}
        >
          Egreso
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <option value="Otro">Otro</option>
            </>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Detalles..."
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <PlusCircle size={20} />
        Agregar Transacción
      </button>
    </form>
  );
}
