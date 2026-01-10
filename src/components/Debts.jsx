import { useState } from 'react';
import Flatpickr from 'react-flatpickr';
import MonthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import { CreditCard, Plus, Trash2, DollarSign, TrendingDown, Calendar, ArrowUpCircle, ChevronDown, ChevronUp, CalendarClock } from 'lucide-react';

export function Debts({ debts, transactions, onAdd, onPay, onSchedule, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [expandedStartId, setExpandedStartId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [newDebt, setNewDebt] = useState({ name: '', amount: '', date: new Date().toISOString().slice(0, 10), paymentDate: '', paymentAmount: '', type: 'personal' });
  
  // States for Paying Now
  const [payingId, setPayingId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString());

  // States for Scheduling Next Payment
  const [schedulingId, setSchedulingId] = useState(null);
  const [scheduleAmount, setScheduleAmount] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount) return;
    onAdd({ 
      ...newDebt, 
      date: newDebt.date ? `${newDebt.date}T12:00:00Z` : '',
      paymentDate: newDebt.paymentDate ? `${newDebt.paymentDate}T12:00:00Z` : '',
      paymentAmount: newDebt.paymentAmount || newDebt.amount
    });
    setNewDebt({ name: '', amount: '', date: new Date().toISOString().slice(0, 10), paymentDate: '', paymentAmount: '', type: 'personal' });
    setIsAdding(false);
  };

  const handlePay = (id) => {
    if (!payAmount) return;
    const formattedDate = payDate.includes('T') ? payDate : `${payDate}T12:00:00Z`;
    onPay(id, payAmount, formattedDate);
    setPayingId(null);
    setPayAmount('');
    setPayDate(new Date().toISOString());
  };

  const handleSchedule = (debt) => {
    if (!scheduleAmount || !scheduleDate) return;
    const formattedDate = scheduleDate.includes('T') ? scheduleDate : `${scheduleDate}T12:00:00Z`;
    onSchedule(debt, formattedDate, scheduleAmount);
    setSchedulingId(null);
    setScheduleAmount('');
    setScheduleDate('');
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
              <Flatpickr
                value={selectedMonth}
                options={{
                  plugins: [new MonthSelectPlugin({ shorthand: true, dateFormat: "Y-m", theme: "airbnb" })],
                  disableMobile: true
                }}
                onChange={([date]) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  setSelectedMonth(`${year}-${month}`);
                }}
                className="w-full sm:w-auto bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 px-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 font-medium cursor-pointer"
                placeholder="Seleccionar Mes"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
              <option value="loan">Préstamo</option>
            </select>
            <input
              type="number"
              placeholder="Monto adeudado"
              value={newDebt.amount}
              onChange={e => setNewDebt({...newDebt, amount: e.target.value})}
              className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2 uppercase tracking-wider ml-1">Fecha de la Deuda</label>
              <Flatpickr
                value={newDebt.date}
                options={{ dateFormat: 'Y-m-d' }}
                onChange={(_, dateStr) => setNewDebt({ ...newDebt, date: dateStr })}
                className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none transition-all font-medium text-slate-800 dark:text-white"
                placeholder="Fecha de la deuda"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-2 uppercase tracking-wider ml-1">Fecha de Pago (Opcional)</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-grow">
                  <Flatpickr
                    value={newDebt.paymentDate}
                    options={{ dateFormat: 'Y-m-d' }}
                    onChange={(_, dateStr) => setNewDebt({ ...newDebt, paymentDate: dateStr })}
                    className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none transition-all font-medium text-slate-800 dark:text-white"
                    placeholder="Fecha próximo pago"
                  />
                </div>
                {newDebt.paymentDate && (
                  <div className="w-full sm:w-32 animate-fade-in">
                    <input
                      type="number"
                      placeholder="Monto"
                      value={newDebt.paymentAmount}
                      onChange={e => setNewDebt({...newDebt, paymentAmount: e.target.value})}
                      className="w-full p-4 border-none rounded-2xl bg-white dark:bg-neutral-900 shadow-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-slate-800 dark:text-white"
                      title="Monto del primer pago"
                    />
                  </div>
                )}
              </div>
            </div>
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
                      : debt.type === 'loan'
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-400'
                  }`}>
                    {debt.type === 'credit-card' ? 'Tarjeta' : debt.type === 'loan' ? 'Préstamo' : 'Personal'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-rose-500 mt-2">${debt.amount.toFixed(2)}</p>
                {debt.date && <p className="text-xs text-slate-400 mt-1">{new Date(debt.date).toLocaleDateString()}</p>}
              </div>

              {payingId === debt.id ? (
                <div className="flex flex-col gap-2 bg-slate-50 dark:bg-neutral-800 p-3 rounded-2xl animate-fade-in">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-slate-400" />
                    <input
                      type="number"
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-neutral-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none font-medium text-slate-800 dark:text-white"
                      placeholder="Monto a pagar"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={16} className="text-slate-400" />
                     <Flatpickr
                        value={payDate}
                        options={{ dateFormat: 'Y-m-d' }}
                        onChange={(_, dateStr) => setPayDate(dateStr)}
                        className="w-full p-2 bg-white dark:bg-neutral-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none font-medium text-slate-800 dark:text-white"
                        placeholder="Fecha de pago"
                      />
                  </div>
                  <div className="flex gap-2 mt-1">
                     <button 
                       onClick={() => {
                         setPayingId(null);
                         setPayAmount('');
                       }}
                       className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-neutral-600 transition-colors"
                     >
                       Cancelar
                     </button>
                     <button 
                       onClick={() => handlePay(debt.id)} 
                       className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
                     >
                       Confirmar
                     </button>
                  </div>
                </div>
              ) : schedulingId === debt.id ? (
                <div className="flex flex-col gap-2 bg-rose-50 dark:bg-rose-900/10 p-3 rounded-2xl animate-fade-in border border-rose-100 dark:border-rose-900/20">
                  <p className="text-xs font-bold text-rose-500 mb-1 ml-1">Programar Próximo Pago</p>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-rose-400" />
                    <input
                      type="number"
                      value={scheduleAmount}
                      onChange={e => setScheduleAmount(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-neutral-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none font-medium text-slate-800 dark:text-white"
                      placeholder="Monto próximo"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2">
                     <CalendarClock size={16} className="text-rose-400" />
                     <Flatpickr
                        value={scheduleDate}
                        options={{ dateFormat: 'Y-m-d', minDate: 'today' }}
                        onChange={(_, dateStr) => setScheduleDate(dateStr)}
                        className="w-full p-2 bg-white dark:bg-neutral-900 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 outline-none font-medium text-slate-800 dark:text-white"
                        placeholder="Fecha próxima"
                      />
                  </div>
                  <div className="flex gap-2 mt-1">
                     <button 
                       onClick={() => {
                         setSchedulingId(null);
                         setScheduleAmount('');
                         setScheduleDate('');
                       }}
                       className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-neutral-600 transition-colors"
                     >
                       Cancelar
                     </button>
                     <button 
                       onClick={() => handleSchedule(debt)} 
                       className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 dark:shadow-rose-900/20"
                     >
                       Programar
                     </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setPayingId(debt.id);
                      setPayAmount('');
                      setPayDate(new Date().toISOString().split('T')[0]);
                      setSchedulingId(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 font-medium text-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <DollarSign size={16} /> Abonar
                  </button>
                  <button 
                    onClick={() => {
                      setSchedulingId(debt.id);
                      setScheduleAmount('');
                      setScheduleDate('');
                      setPayingId(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-slate-50 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 font-medium text-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <CalendarClock size={16} /> Programar
                  </button>
                </div>
              )}

              <div className="mt-4 border-t border-slate-100 dark:border-neutral-800 pt-4">
                 <button 
                  onClick={() => setExpandedStartId(expandedStartId === debt.id ? null : debt.id)}
                  className="w-full flex items-center justify-between text-xs font-medium text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300"
                 >
                  <span>Historial de Pagos</span>
                  {expandedStartId === debt.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                 </button>

                 {expandedStartId === debt.id && (
                   <div className="mt-3 space-y-2 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                     {transactions && transactions.filter(t => t.debt_id === debt.id).length > 0 ? (
                       transactions.filter(t => t.debt_id === debt.id).map(payment => (
                         <div key={payment.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-neutral-800/50 rounded-lg">
                           <span className="text-slate-500 dark:text-neutral-400">{new Date(payment.date).toLocaleDateString()}</span>
                           <span className="font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-1.5 py-0.5 rounded ml-auto flex items-center gap-1">
                             <ArrowUpCircle size={10} />
                             ${payment.amount.toFixed(2)}
                           </span>
                         </div>
                       ))
                     ) : (
                       <p className="text-xs text-center text-slate-400 dark:text-neutral-600 italic py-2">No hay pagos registrados</p>
                     )}
                   </div>
                 )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
