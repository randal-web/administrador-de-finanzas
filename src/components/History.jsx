import { Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export function History({ transactions, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Historial Reciente</h2>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay transacciones registradas</p>
        ) : (
          transactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {transaction.type === 'income' ? (
                  <ArrowUpCircle className="text-green-500" size={24} />
                ) : (
                  <ArrowDownCircle className="text-red-500" size={24} />
                )}
                <div>
                  <p className="font-medium text-gray-800">{transaction.category}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()} 
                    {transaction.description && ` - ${transaction.description}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </span>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
