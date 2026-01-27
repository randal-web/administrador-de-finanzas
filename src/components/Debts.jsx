import { useState } from 'react';
import { createPortal } from 'react-dom';
import Flatpickr from 'react-flatpickr';
import MonthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import { 
  CreditCard as CreditCardIcon, Plus, Trash2, DollarSign, TrendingUp, TrendingDown,
  Calendar, ArrowUpCircle, ChevronDown, ChevronUp, CalendarClock, 
  AlertCircle, Wallet, Landmark, Info, Check, Scissors, PiggyBank, Clock, MoreHorizontal, Pencil, Percent, Banknote, X
} from 'lucide-react';

const CARD_COLORS = [
  { id: 'black', bg: 'from-slate-800 via-slate-900 to-black', name: 'Negro', value: '#1e293b' },
  { id: 'blue', bg: 'from-blue-500 via-indigo-500 to-violet-600', name: 'Azul', value: '#3b82f6' },
  { id: 'purple', bg: 'from-violet-500 via-purple-500 to-fuchsia-600', name: 'Púrpura', value: '#8b5cf6' },
  { id: 'rose', bg: 'from-rose-500 via-red-500 to-orange-600', name: 'Rosa', value: '#ef4444' },
  { id: 'gold', bg: 'from-amber-400 via-orange-400 to-yellow-600', name: 'Dorado', value: '#f59e0b' },
  { id: 'teal', bg: 'from-teal-500 via-emerald-500 to-cyan-600', name: 'Verde', value: '#10b981' },
];

export function Debts({ debts, transactions, onAdd, onPay, onSchedule, onUpdate, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [expandedStartId, setExpandedStartId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const [newDebt, setNewDebt] = useState({ 
    name: '', amount: '', date: new Date().toISOString().slice(0, 10), paymentDate: '', 
    paymentAmount: '', type: 'personal', creditLimit: '', cutoffDay: '', paymentDay: '', color: 'black',
    totalAmount: '', endDate: ''
  });
  
  const [payingId, setPayingId] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toLocaleDateString('en-CA'));

  const getDaysUntil = (day) => {
    if (!day) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    let nextDate = new Date(currentYear, currentMonth, day);
    if (nextDate <= today) nextDate = new Date(currentYear, currentMonth + 1, day);
    return Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
  };

  const handleEdit = (debt) => {
    setEditingId(debt.id);
    setNewDebt({
      name: debt.name,
      amount: debt.amount,
      date: debt.date ? debt.date.split('T')[0] : new Date().toISOString().slice(0, 10),
      paymentDate: '',
      paymentAmount: '',
      type: debt.type,
      creditLimit: debt.credit_limit || debt.creditLimit || '',
      cutoffDay: debt.cutoff_day || debt.cutoffDay || '',
      paymentDay: debt.payment_day || debt.paymentDay || '',
      color: debt.color || 'black',
      totalAmount: debt.total_amount || debt.totalAmount || '',
      endDate: debt.end_date ? debt.end_date.split('T')[0] : (debt.endDate ? debt.endDate.split('T')[0] : '')
    });
    setIsAdding(true);
    setMenuOpenId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDebt.name || !newDebt.amount) return;
    
    const payload = {
      name: newDebt.name,
      amount: parseFloat(newDebt.amount),
      date: newDebt.date ? `${newDebt.date}T12:00:00Z` : '',
      type: newDebt.type,
      creditLimit: newDebt.creditLimit ? parseFloat(newDebt.creditLimit) : null,
      cutoffDay: newDebt.cutoffDay ? parseInt(newDebt.cutoffDay) : null,
      paymentDay: newDebt.paymentDay ? parseInt(newDebt.paymentDay) : null,
      color: newDebt.color,
      totalAmount: newDebt.totalAmount ? parseFloat(newDebt.totalAmount) : null,
      endDate: newDebt.endDate ? `${newDebt.endDate}T12:00:00Z` : null
    };

    if (editingId) {
      onUpdate(editingId, payload);
    } else {
      onAdd({ 
        ...payload, 
        paymentDate: newDebt.paymentDate ? `${newDebt.paymentDate}T12:00:00Z` : '',
        paymentAmount: newDebt.paymentAmount || newDebt.amount
      });
    }
    
    setNewDebt({ 
      name: '', amount: '', date: new Date().toISOString().slice(0, 10), paymentDate: '', 
      paymentAmount: '', type: 'personal', creditLimit: '', cutoffDay: '', paymentDay: '', color: 'black',
      totalAmount: '', endDate: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handlePay = (id) => {
    if (!payAmount) return;
    
    // Obtener fechas en formato YYYY-MM-DD local para comparación segura
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
    const selectedDateStr = payDate.slice(0, 10);

    if (selectedDateStr > todayStr) {
       const debt = debts.find(d => d.id === id);
       if (debt) onSchedule(debt, payDate, payAmount);
    } else {
       onPay(id, payAmount, payDate.includes('T') ? payDate : `${payDate}T12:00:00Z`);
    }
    setPayingId(null);
    setPayAmount('');
    setPayDate(new Date().toLocaleDateString('en-CA'));
  };

  const filteredDebts = debts.filter(debt => {
    if (showAll || debt.type === 'credit-card') return true;
    return debt.date && debt.date.startsWith(selectedMonth);
  });

  const creditCards = filteredDebts.filter(d => d.type === 'credit-card');
  const loans = filteredDebts.filter(d => d.type !== 'credit-card');

  const totalDebt = filteredDebts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalLimit = creditCards.reduce((acc, curr) => acc + (curr.credit_limit || curr.creditLimit || 0), 0);

  return (
    <div className="bg-white dark:bg-neutral-900 p-4 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-50 dark:border-neutral-800 animate-fade-in" onClick={() => setMenuOpenId(null)}>
      {/* HEADER RESPONSIVE */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="w-full lg:w-auto">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
            <div className="p-2 md:p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-500 dark:text-rose-400">
              <CreditCardIcon size={20} className="md:w-6 md:h-6" />
            </div>
            Control de Deudas
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 ml-1">
             <p className="text-sm text-slate-400 dark:text-neutral-500 font-medium">
              Acumulado ({showAll ? 'Histórico' : selectedMonth}): <span className="text-rose-500 font-bold block sm:inline text-lg sm:text-sm">${totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </p>
            {totalLimit > 0 && (
              <div className="hidden sm:block w-px h-4 bg-slate-200 dark:bg-neutral-800" />
            )}
            {totalLimit > 0 && (
              <p className="text-sm text-slate-400 dark:text-neutral-500 font-medium">
               Crédito Total: <span className="text-slate-600 dark:text-neutral-300 font-bold block sm:inline">${totalLimit.toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <button
            onClick={() => setShowAll(!showAll)}
            className={`flex-1 sm:flex-none px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
              showAll 
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/20' 
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
            }`}
          >
            {showAll ? 'Viendo todas' : 'Ver todas'}
          </button>

          {!showAll && (
            <div className="relative flex-1 sm:flex-none z-50">
              <Flatpickr
                value={new Date(selectedMonth + '-01')}
                options={{
                  plugins: [new MonthSelectPlugin({ shorthand: true, dateFormat: "Y-m", theme: "airbnb" })],
                  disableMobile: true,
                  static: true
                }}
                onChange={([date]) => {
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  setSelectedMonth(`${year}-${month}`);
                }}
                className="w-full sm:w-auto bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 px-4 py-3 rounded-2xl border-none outline-none focus:ring-2 focus:ring-rose-100 dark:focus:ring-rose-900 font-semibold text-sm cursor-pointer"
                placeholder="Mes"
              />
            </div>
          )}
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setEditingId(null);
              setNewDebt({ 
                name: '', amount: '', date: new Date().toISOString().slice(0, 10), paymentDate: '', 
                paymentAmount: '', type: 'personal', creditLimit: '', cutoffDay: '', paymentDay: '', color: 'black',
                totalAmount: '', endDate: ''
              });
            }}
            className="flex-1 sm:flex-none text-sm bg-slate-900 dark:bg-blue-600 text-white px-5 py-3 rounded-2xl hover:opacity-90 font-bold transition-all shadow-lg shadow-slate-200 dark:shadow-none transform active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            {isAdding ? 'Cerrar' : <><Plus size={18} /> Nueva Deuda</>}
          </button>
        </div>
      </div>

      {/* FORMULARIO RESPONSIVE */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-10 p-5 md:p-8 bg-slate-50 dark:bg-neutral-800/50 rounded-3xl border border-slate-100 dark:border-neutral-700 animate-fade-in" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? 'Editar Deuda' : 'Nueva Deuda'}</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="p-2 hover:bg-white dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-400"><X size={20}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Nombre / Banco</label>
              <input type="text" placeholder="Ej: Visa Oro, BBVA" value={newDebt.name} onChange={e => setNewDebt({...newDebt, name: e.target.value})} className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none text-slate-800 dark:text-white font-medium shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all" required />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Tipo</label>
              <select value={newDebt.type} onChange={e => setNewDebt({...newDebt, type: e.target.value})} className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none text-slate-800 dark:text-white font-medium cursor-pointer shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all">
                <option value="personal">Personal / Amigo</option>
                <option value="credit-card">Tarjeta de Crédito</option>
                <option value="loan">Préstamo Bancario</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">{newDebt.type === 'loan' ? 'Monto Restante' : 'Saldo Actual'}</label>
              <input type="number" placeholder="0.00" value={newDebt.amount} onChange={e => setNewDebt({...newDebt, amount: e.target.value})} className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none text-slate-800 dark:text-white font-medium shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all" required />
            </div>
          </div>

          {(newDebt.type === 'credit-card' || newDebt.type === 'loan') && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6 animate-in slide-in-from-top-2">
              {newDebt.type === 'credit-card' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Límite</label>
                    <input type="number" placeholder="Ej. 50000" value={newDebt.creditLimit} onChange={e => setNewDebt({...newDebt, creditLimit: e.target.value})} className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none font-medium shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Día Corte (1-31)</label>
                    <input type="number" min="1" max="31" value={newDebt.cutoffDay} onChange={e => setNewDebt({...newDebt, cutoffDay: e.target.value})} className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none font-medium shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Día Pago (1-31)</label>
                    <input type="number" min="1" max="31" value={newDebt.paymentDay} onChange={e => setNewDebt({...newDebt, paymentDay: e.target.value})} className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none font-medium shadow-sm" />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Monto Total Original</label>
                    <input type="number" placeholder="Ej. 100000" value={newDebt.totalAmount} onChange={e => setNewDebt({...newDebt, totalAmount: e.target.value})} className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none font-medium shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Día Pago (1-28)</label>
                    <input type="number" min="1" max="28" value={newDebt.paymentDay} onChange={e => setNewDebt({...newDebt, paymentDay: e.target.value})} className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none font-medium shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Fecha de Término</label>
                    <Flatpickr
                      value={newDebt.endDate} options={{ dateFormat: 'Y-m-d' }}
                      onChange={(_, dateStr) => setNewDebt({ ...newDebt, endDate: dateStr })}
                      className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none text-slate-800 dark:text-white font-medium shadow-sm"
                      placeholder="Opcional"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="space-y-3">
               <label className="text-xs font-bold text-slate-400 uppercase ml-1">Color / Estilo</label>
               <div className="flex flex-wrap gap-3">
                 {CARD_COLORS.map(c => (
                   <button type="button" key={c.id} onClick={() => setNewDebt({...newDebt, color: c.id})} className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.bg} ${newDebt.color === c.id ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-neutral-900 scale-110' : ''} transition-all active:scale-90`} />
                 ))}
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Fecha {newDebt.type === 'credit-card' ? 'Apertura' : 'Inicio'}</label>
              <Flatpickr
                value={newDebt.date} options={{ dateFormat: 'Y-m-d' }}
                onChange={(_, dateStr) => setNewDebt({ ...newDebt, date: dateStr })}
                className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none text-slate-800 dark:text-white font-medium shadow-sm"
              />
            </div>
          </div>
          
          {!editingId && (
            <div className="mb-8">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Programar Primer Pago (Opcional)</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow">
                  <Flatpickr value={newDebt.paymentDate} options={{ dateFormat: 'Y-m-d' }} onChange={(_, dateStr) => setNewDebt({ ...newDebt, paymentDate: dateStr })} placeholder="Elegir fecha" className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none font-medium shadow-sm" />
                </div>
                {newDebt.paymentDate && (
                  <div className="w-full sm:w-40 animate-in fade-in slide-in-from-left-2">
                    <input type="number" placeholder="Monto $" value={newDebt.paymentAmount} onChange={e => setNewDebt({...newDebt, paymentAmount: e.target.value})} className="w-full p-4 bg-white dark:bg-neutral-900 rounded-2xl border-none outline-none font-bold shadow-sm text-blue-600" />
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl active:scale-[0.98]">
            {editingId ? 'Guardar Cambios' : 'Confirmar Registro'}
          </button>
        </form>
      )}

      {/* CREDIT CARDS GRID */}
      {creditCards.length > 0 && (
        <div className="mb-12 space-y-5">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Tarjetas Premium</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {creditCards.map((card, index) => {
              const limit = card.credit_limit || card.creditLimit || 0;
              const usagePercent = limit > 0 ? (card.amount / limit) * 100 : 0;
              const style = CARD_COLORS.find(c => c.id === card.color) || CARD_COLORS[index % CARD_COLORS.length];
              const daysCutoff = getDaysUntil(card.cutoff_day || card.cutoffDay);
              const daysPayment = getDaysUntil(card.payment_day || card.paymentDay);

              return (
                <div key={card.id} className="group space-y-4 max-w-sm mx-auto w-full md:max-w-none">
                  {/* Visual Card Responsive */}
                  <div className={`relative aspect-[1.586/1] w-full rounded-3xl bg-gradient-to-br ${style.bg} p-5 md:p-7 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1.5 overflow-hidden`}>
                    <div className="absolute right-6 top-6 h-16 w-16 rounded-full bg-white/10" />
                    <div className="absolute right-2 top-10 h-12 w-12 rounded-full bg-white/10" />
                    <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 400 250" preserveAspectRatio="none">
                      <path d="M0,100 C100,150 200,50 400,100 L400,250 L0,250 Z" fill="white" fillOpacity="0.1" />
                      <path d="M0,150 C150,100 250,200 400,150 L400,250 L0,250 Z" fill="white" fillOpacity="0.05" />
                    </svg>

                    <div className="relative z-10 h-full flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">Credit Card</p>
                          <h3 className="text-base md:text-lg font-bold tracking-wide truncate max-w-[150px] md:max-w-none">{card.name}</h3>
                        </div>
                        <div className="relative">
                          <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === card.id ? null : card.id); }} className="p-2.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                          {menuOpenId === card.id && (
                            <div className="absolute right-0 top-11 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-neutral-700 py-2 z-50 min-w-[160px] animate-in fade-in zoom-in-95">
                              <button onClick={() => setPayingId(card.id)} className="w-full text-left px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-3 font-semibold">
                                <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><DollarSign size={14} /></div> Abonar
                              </button>
                              <button onClick={() => handleEdit(card)} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-700 flex items-center gap-3">
                                <div className="p-1.5 bg-slate-100 dark:bg-neutral-700 rounded-lg"><Pencil size={14} /></div> Editar
                              </button>
                              <div className="h-px bg-slate-100 dark:bg-neutral-700 mx-2 my-1" />
                              <button onClick={() => onDelete(card.id)} className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3">
                                <div className="p-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg"><Trash2 size={14} /></div> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-8 w-11 md:h-9 md:w-12 rounded-md bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 shadow-inner">
                          <div className="grid h-full w-full grid-cols-2 gap-px p-1.5 opacity-40">
                            <div className="border-r border-b border-black/20" />
                            <div className="border-b border-black/20" />
                            <div className="border-r border-black/20" />
                            <div />
                          </div>
                        </div>
                        <div className="h-5 w-5 md:h-6 md:w-6 rounded-full border-2 border-white/30" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xl md:text-2xl font-black tabular-nums">${card.amount.toLocaleString()}</span>
                          <span className="text-[10px] md:text-sm font-bold text-white/70">{usagePercent.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white transition-all duration-700 shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
                        </div>
                        <p className="text-[9px] md:text-[10px] text-white/50 uppercase font-bold tracking-widest">Límite ${limit.toLocaleString()}</p>
                      </div>
                    </div>

                    
                  </div>

                  {/* Info Grid Responsive */}
                  <div className="grid grid-cols-3 gap-2 px-1">
                    <div className="rounded-2xl bg-slate-50 dark:bg-neutral-800/50 p-2.5 md:p-3 shadow-sm border border-slate-100/50 dark:border-neutral-800">
                      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wide text-slate-400">Disponible</p>
                      <p className={`mt-1 text-xs md:text-sm font-black truncate ${usagePercent > 80 ? 'text-rose-500' : 'text-emerald-500'}`}>${(limit - card.amount).toLocaleString()}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-neutral-800/50 p-2.5 md:p-3 shadow-sm border border-slate-100/50 dark:border-neutral-800">
                      <div className="flex items-center gap-1 text-slate-400"><Scissors size={10} className="hidden sm:block"/><p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wide">Corte</p></div>
                      <p className="mt-1 text-xs md:text-sm font-black text-slate-700 dark:text-white truncate">Día {card.cutoff_day || card.cutoffDay} <span className="text-[9px] font-normal text-slate-400 ml-0.5">({daysCutoff}d)</span></p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-neutral-800/50 p-2.5 md:p-3 shadow-sm border border-slate-100/50 dark:border-neutral-800">
                      <div className="flex items-center gap-1 text-slate-400"><Calendar size={10} className="hidden sm:block"/><p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wide">Pago</p></div>
                      <p className="mt-1 text-xs md:text-sm font-black text-slate-700 dark:text-white truncate">Día {card.payment_day || card.paymentDay} <span className={`text-[9px] font-normal ml-0.5 ${daysPayment && daysPayment <= 5 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>({daysPayment}d)</span></p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LOANS GRID RESPONSIVE */}
      <div className="space-y-5">
        {creditCards.length > 0 && <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 pt-4">Préstamos y Otros Pasivos</h3>}
        {loans.length === 0 && creditCards.length === 0 && (
           <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 dark:text-neutral-600">
            <div className="w-20 h-20 bg-slate-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-5">
              <TrendingUp size={32} className="text-slate-300 dark:text-neutral-600" />
            </div>
            <p className="font-bold text-lg">¡Libre de deudas este mes!</p>
            <p className="text-sm opacity-60">Usa el botón "Nueva Deuda" para registrar una.</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loans.map((loan, index) => {
            const style = CARD_COLORS.find(c => c.id === loan.color) || CARD_COLORS[index % CARD_COLORS.length];
            const total = loan.total_amount || loan.totalAmount || loan.amount;
            const remaining = loan.amount;
            const paid = total - remaining;
            const progress = total > 0 ? (paid / total) * 100 : 0;
            const daysUntil = loan.payment_day || loan.paymentDay ? getDaysUntil(loan.payment_day || loan.paymentDay) : null;
            const endDate = loan.end_date || loan.endDate;

            return (
              <div key={loan.id} className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-neutral-900 shadow-sm ring-1 ring-slate-100 dark:ring-neutral-800 transition-all hover:shadow-xl">
                <div className={`relative h-2.5 bg-gradient-to-r ${style.bg}`} />
                <div className="p-5 md:p-7">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-neutral-800 ring-1 ring-slate-100 dark:ring-neutral-700`}>
                        <Landmark size={24} style={{ color: style.value }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{loan.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{loan.type === 'loan' ? 'Préstamo' : 'Personal'}</p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === loan.id ? null : loan.id); }} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                      {menuOpenId === loan.id && (
                        <div className="absolute right-0 top-11 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-neutral-700 py-2 z-50 min-w-[160px] animate-in fade-in zoom-in-95">
                          <button onClick={() => setPayingId(loan.id)} className="w-full text-left px-4 py-3 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center gap-3 font-semibold">
                            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><DollarSign size={14} /></div> Abonar
                          </button>
                          <button onClick={() => handleEdit(loan)} className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-700 flex items-center gap-3">
                            <div className="p-1.5 bg-slate-100 dark:bg-neutral-700 rounded-lg"><Pencil size={14} /></div> Editar
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-neutral-700 mx-2 my-1" />
                          <button onClick={() => onDelete(loan.id)} className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3">
                            <div className="p-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg"><Trash2 size={14} /></div> Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="mb-2 flex items-baseline justify-between">
                      <span className="text-3xl font-black text-slate-800 dark:text-white tabular-nums">${remaining.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Por pagar</span>
                    </div>
                    
                    <div className="relative h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-neutral-800">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: style.value }}
                      />
                    </div>
                    
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-black uppercase tracking-tight text-slate-400">
                      <span>${paid.toLocaleString()} PAGADO</span>
                      <span className="bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-300">{progress.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-2xl bg-slate-50 dark:bg-neutral-800/50 p-3.5 border border-slate-100/50 dark:border-neutral-800">
                      <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                        <Calendar size={12} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Fecha Inicio</span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-white">{new Date(loan.date).toLocaleDateString()}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 dark:bg-neutral-800/50 p-3.5 border border-slate-100/50 dark:border-neutral-800">
                      <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                        <TrendingDown size={12} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">Historial</span>
                      </div>
                      <button onClick={() => setExpandedStartId(expandedStartId === loan.id ? null : loan.id)} className="text-[9px] font-black text-blue-500 uppercase hover:text-blue-600 transition-colors">Detalles →</button>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-50 dark:border-neutral-800 pt-5 gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                      <CalendarClock size={14} className="text-slate-300" />
                      <span>{formatDateShort(loan.date)} — {endDate ? formatDateShort(endDate) : 'Indefinido'}</span>
                    </div>
                    
                    {daysUntil !== null && (
                      <div className={`self-start sm:self-auto rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-tight shadow-sm ${daysUntil <= 5 ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-100' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'}`}>
                        Próximo pago en {daysUntil}d
                      </div>
                    )}
                  </div>
                </div>

                
              </div>
            );
          })}
        </div>
      </div>

      {/* HISTORIAL EXPANDIDO RESPONSIVE */}
      {expandedStartId && (
        <div className="mt-10 bg-white dark:bg-neutral-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-100 dark:border-neutral-800 shadow-2xl animate-in slide-in-from-bottom-6" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-8 px-1">
            <div>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Info size={16} className="text-blue-500"/> Historial de Movimientos
              </h3>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">Registro detallado de transacciones</p>
            </div>
            <button onClick={() => setExpandedStartId(null)} className="p-2.5 bg-slate-50 dark:bg-neutral-800 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={18}/></button>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {transactions && transactions.filter(t => t.debt_id === expandedStartId || t.debtId === expandedStartId).length > 0 ? (
               transactions.filter(t => t.debt_id === expandedStartId || t.debtId === expandedStartId).map(payment => (
                 <div key={payment.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-neutral-700 transition-all">
                   <div className="flex items-center gap-4">
                     <div className={`p-2.5 rounded-xl ${payment.type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500 shadow-sm'}`}>
                        {payment.type === 'expense' ? <TrendingDown size={16}/> : <ArrowUpCircle size={16}/>}
                     </div>
                     <div className="min-w-0">
                       <p className="font-bold text-slate-700 dark:text-white text-sm truncate">{payment.description || 'Movimiento de deuda'}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{new Date(payment.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                     </div>
                   </div>
                   <span className={`font-black text-sm whitespace-nowrap ml-4 ${payment.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'}`}>
                     {payment.type === 'expense' ? '+' : '-'}${payment.amount.toLocaleString()}
                   </span>
                 </div>
               ))
             ) : (
               <div className="text-center py-12">
                 <div className="w-12 h-12 bg-slate-50 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-3 opacity-50">
                   <Info size={20} className="text-slate-300" />
                 </div>
                 <p className="text-slate-400 italic text-sm font-medium">No hay movimientos registrados para esta deuda.</p>
               </div>
             )}
          </div>
        </div>
      )}
      {/* CENTRALIZED PAYMENT MODAL */}
      {payingId && (() => {
        const payingDebt = debts.find(d => d.id === payingId);
        if (!payingDebt) return null;
        
        const todayStr = new Date().toLocaleDateString('en-CA');
        const selectedDateStr = payDate ? payDate.slice(0, 10) : todayStr;
        const isFuture = selectedDateStr > todayStr;

        return createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/30 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setPayingId(null)}>
            <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50 dark:border-neutral-800 p-8 relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
               <button onClick={() => setPayingId(null)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-slate-400">
                 <X size={20} />
               </button>
               
               <div className="text-center mb-8">
                 <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                   <DollarSign size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white">Abonar a Deuda</h3>
                 <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium mt-1">{payingDebt.name}</p>
               </div>

               <div className="space-y-4 mb-8">
                 <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-lg">$</span>
                   <input 
                     type="number" 
                     autoFocus 
                     placeholder="0.00" 
                     value={payAmount} 
                     onChange={e => setPayAmount(e.target.value)} 
                     className="w-full p-4 pl-8 bg-slate-50 dark:bg-neutral-800 rounded-2xl border-none outline-none font-black text-2xl text-center text-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-all" 
                   />
                 </div>
                 
                 <div className="bg-slate-50 dark:bg-neutral-800 rounded-2xl p-1 flex items-center">
                    <div className="p-3 text-slate-400">
                      <Calendar size={20}/>
                    </div>
                    <Flatpickr 
                      value={payDate} 
                      options={{ dateFormat: 'Y-m-d', minDate: 'today' }} 
                      onChange={(_, dateStr) => setPayDate(dateStr)} 
                      className="w-full bg-transparent border-none outline-none font-bold text-slate-600 dark:text-neutral-300 text-sm p-2"
                      placeholder="Fecha del pago"
                    />
                 </div>
               </div>

               <div className="flex gap-3">
                 <button onClick={() => setPayingId(null)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors text-sm">
                   Cancelar
                 </button>
                 <button 
                   onClick={() => handlePay(payingDebt.id)} 
                   disabled={!payAmount}
                   className={`flex-[2] py-3.5 rounded-xl font-bold text-white shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2 ${
                     !payAmount ? 'bg-slate-300 dark:bg-neutral-700 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'
                   }`}
                 >
                   {isFuture ? 'Programar' : 'Confirmar Pago'}
                 </button>
               </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}