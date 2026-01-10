import { useState, useMemo } from 'react';
import Flatpickr from 'react-flatpickr';
import MonthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, CreditCard, Target, Calendar, Calculator, AlertCircle } from 'lucide-react';
import { History } from './History';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, amount, icon: IconComponent, colorClass, bgClass, subtitle, delay }) => (
  <div 
    className="relative bg-white/70 dark:bg-neutral-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/40 dark:border-neutral-800/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group animate-scale-in overflow-hidden"
    style={{ animationDelay: delay }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5 dark:via-transparent dark:to-transparent opacity-50 pointer-events-none" />
    <div className="relative z-10 flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 mb-1 group-hover:text-slate-600 dark:group-hover:text-neutral-300 transition-colors">{title}</p>
        <h3 className={`text-3xl font-bold ${colorClass} tracking-tight`}>${amount.toFixed(2)}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${bgClass} dark:bg-opacity-20 transition-transform duration-300 group-hover:scale-110 backdrop-blur-sm`}>
        <IconComponent size={22} className={colorClass.replace('text-', 'text-')} />
      </div>
    </div>
    <p className="relative z-10 text-xs text-slate-400 dark:text-neutral-500 font-medium">{subtitle}</p>
  </div>
);

export function Dashboard({ stats: globalStats, transactions, goals, debts, expectedIncome, subscriptions = [], onDelete }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showAllStats, setShowAllStats] = useState(false);

  // Filter transactions and calculate period stats
  const periodStats = useMemo(() => {
    if (showAllStats) return globalStats;

    const filtered = transactions.filter(t => t.date.startsWith(selectedMonth));
    
    const income = filtered
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const expenses = filtered
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const savings = filtered
      .filter(t => t.type === 'expense' && (t.category === 'Ahorro' || t.category === 'Inversión'))
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      balance: income - expenses, // Net change for the period
      income,
      expenses,
      savings
    };
  }, [transactions, selectedMonth, showAllStats, globalStats]);

  // Proyección Mensual
  const monthlyProjection = useMemo(() => {
    // Solo calcular para meses actuales o futuros para "Pendientes"
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const isPast = selectedMonth < currentMonthStr;

    // 1. Ingresos Esperados (ExpectedIncome)
    // Asumimos que expectedIncome tiene fechas y filtramos por mes seleccionado
    const expected = expectedIncome
      ?.filter(item => item.date && item.date.startsWith(selectedMonth))
      .reduce((acc, curr) => acc + curr.amount, 0) || 0;

    // 2. Gastos Reales (Ya realizados)
    const actualExpenses = periodStats.expenses;

    // 3. Gastos Pendientes (Suscripciones y Deudas no pagadas este mes)
    let pending = 0;
    
    // Si estamos viendo el pasado, asumimos pendientes = 0 (lo hecho, hecho está)
    // Si estamos viendo presente o futuro, calculamos qué falta pagar
    if (!isPast) {
       pending = subscriptions.reduce((acc, sub) => {
         // Verificar si aplica este mes
         let applies = false;
         if (sub.frequency === 'monthly' || !sub.frequency) applies = true;
         else if (sub.date && sub.date.startsWith(selectedMonth)) applies = true;
         else if (sub.frequency === 'yearly') {
            // Verificar si el mes y año coinciden con la fecha anual
            // Pero annual date es "2024-05-10". Si selected es "2025-05", aplica? 
            // La logica actual de Subscriptions es simple: date es la fecha proxima de pago.
            // Si date.startsWith(selectedMonth) -> aplica.
            if (sub.date && sub.date.startsWith(selectedMonth)) applies = true;
         }

         if (!applies) return acc;

         // Verificar si ya se pagó en este mes seleccionado
         let isPaid = false;
         
         // Si es pago único y status es 'paid'
         if ((sub.frequency === 'one-time' || sub.debt_id) && sub.status === 'paid') isPaid = true;

         // Verificar lastPaymentDate (pago reciente)
         if (sub.lastPaymentDate && sub.lastPaymentDate.startsWith(selectedMonth)) isPaid = true;

         // Verificar si existe una transacción con ese nombre este mes (más robusto)
         // const hasTransaction = transactions.some(t => 
         //   t.type === 'expense' && 
         //   t.date.startsWith(selectedMonth) && 
         //   (t.description.includes(sub.name) || (sub.debt_id && t.description.includes('deuda')))
         // );
         // if (hasTransaction) isPaid = true;

         return isPaid ? acc : acc + sub.amount;
       }, 0);
    }

    const totalProjectedExpenses = actualExpenses + pending;
    const remaining = expected - totalProjectedExpenses;

    return {
      expected,
      actualExpenses,
      pending,
      totalProjectedExpenses,
      remaining
    };
  }, [expectedIncome, subscriptions, periodStats, selectedMonth]);

  // Datos para la gráfica de barras
  const chartData = [
    { name: 'Ingresos', value: periodStats.income, color: '#34d399' }, 
    { name: 'Egresos', value: periodStats.expenses, color: '#fb7185' }, 
    { name: 'Ahorros', value: periodStats.savings, color: '#60a5fa' }, 
  ];

  const totalDebts = debts?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  
  const totalExpectedIncome = useMemo(() => {
    if (showAllStats) {
      return expectedIncome?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    }
    return expectedIncome
      ?.filter(item => item.date && item.date.startsWith(selectedMonth))
      .reduce((acc, curr) => acc + curr.amount, 0) || 0;
  }, [expectedIncome, showAllStats, selectedMonth]);

  const totalGoalsTarget = goals?.reduce((acc, curr) => acc + curr.targetAmount, 0) || 0;
  const totalGoalsCurrent = goals?.reduce((acc, curr) => acc + curr.currentAmount, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4">
        <button
          onClick={() => setShowAllStats(!showAllStats)}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium transition-all text-sm ${
            showAllStats 
              ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md' 
              : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700'
          }`}
        >
          {showAllStats ? 'Ver Histórico Completo' : 'Ver por Mes'}
        </button>

        {!showAllStats && (
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
              className="w-full sm:w-auto bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-white px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-neutral-700 font-medium text-sm text-center cursor-pointer shadow-sm"
              placeholder="Seleccionar Mes"
            />
          </div>
        )}
      </div>

      {/* Proyección Mensual Card */}
      {!showAllStats && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Calculator size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                 <Target className="text-indigo-300" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Proyección Mensual</h3>
                <p className="text-indigo-200 text-sm">Estimación basada en ingresos esperados y pagos pendientes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                <p className="text-indigo-300 text-sm font-medium">Ingresos Esperados</p>
                <p className="text-3xl font-bold tracking-tight">${monthlyProjection.expected.toFixed(2)}</p>
                <div className="h-1.5 w-full bg-indigo-900/50 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-indigo-300 text-sm font-medium flex items-center gap-2">
                  Gastos Totales
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white/80">Reales + Pendientes</span>
                </p>
                <p className="text-3xl font-bold tracking-tight">${monthlyProjection.totalProjectedExpenses.toFixed(2)}</p>
                <p className="text-xs text-indigo-300">
                  Realizado: ${monthlyProjection.actualExpenses.toFixed(0)} | Pendiente: ${monthlyProjection.pending.toFixed(0)}
                </p>
                <div className="h-1.5 w-full bg-indigo-900/50 rounded-full mt-2 overflow-hidden flex">
                   <div 
                      className="h-full bg-rose-400" 
                      style={{ width: `${Math.min((monthlyProjection.actualExpenses / (monthlyProjection.expected || 1)) * 100, 100)}%` }}
                   ></div>
                   <div 
                      className="h-full bg-rose-300/50" 
                      style={{ width: `${Math.min((monthlyProjection.pending / (monthlyProjection.expected || 1)) * 100, 100)}%` }}
                   ></div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-indigo-300 text-sm font-medium">Saldo Restante Estimado</p>
                <div className="flex items-center gap-2">
                   <p className={`text-3xl font-bold tracking-tight ${monthlyProjection.remaining < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                     ${monthlyProjection.remaining.toFixed(2)}
                   </p>
                   {monthlyProjection.remaining < 0 && <AlertCircle size={20} className="text-rose-400" />}
                </div>
                <p className="text-xs text-indigo-300">
                  {monthlyProjection.remaining < 0 ? 'Atención: Gastos superan ingresos esperados' : 'Capacidad de ahorro potencial'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={showAllStats ? "Balance Total" : "Result. del Mes"} 
          amount={showAllStats ? globalStats.balance : periodStats.balance} 
          icon={Wallet} 
          colorClass="text-slate-700 dark:text-neutral-200" 
          bgClass="bg-slate-100 dark:bg-neutral-800"
          subtitle={showAllStats ? "Saldo disponible" : "Ingresos - Egresos"}
          delay="0s"
        />
        <StatCard 
          title="Ingresos" 
          amount={periodStats.income} 
          icon={TrendingUp} 
          colorClass="text-emerald-500" 
          bgClass="bg-emerald-50"
          subtitle={showAllStats ? "Histórico total" : "En este periodo"}
          delay="0.1s"
        />
        <StatCard 
          title="Egresos" 
          amount={periodStats.expenses} 
          icon={TrendingDown} 
          colorClass="text-rose-500" 
          bgClass="bg-rose-50"
          subtitle={showAllStats ? "Histórico total" : "En este periodo"}
          delay="0.2s"
        />
        <StatCard 
          title="Ahorros" 
          amount={periodStats.savings} 
          icon={PiggyBank} 
          colorClass="text-blue-500" 
          bgClass="bg-blue-50"
          subtitle="Acumulados"
          delay="0.3s"
        />
      </div>

      {/* Sección Principal: Gráfica y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfica */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-50 dark:border-neutral-800">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Resumen {showAllStats ? '' : 'Mensual'}</h3>
            <p className="text-sm text-slate-400 dark:text-neutral-500 font-medium mt-1">
              Visualización de tus finanzas {showAllStats ? 'históricas' : `de ${selectedMonth}`}
            </p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-neutral-800" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc', opacity: 0.5 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    color: '#1e293b'
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historial Reciente */}
        <div className="lg:col-span-1 h-full">
           <History transactions={transactions} onDelete={onDelete} />
           {/* Note: History component might need update if we want to filter it too, but user only asked for stats periods. Let's keep history as 'all recent' for now or consistent? Usually dashboard history is just 'recent activity'. Let's keep it global for context unless user complains. */}
        </div>
      </div>

      {/* Resumen Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Deudas Totales" 
          amount={totalDebts} 
          icon={CreditCard} 
          colorClass="text-red-500" 
          bgClass="bg-red-50"
          subtitle="Total a pagar"
          delay="0.4s"
        />
        <StatCard 
          title="Ingresos Esperados" 
          amount={totalExpectedIncome} 
          icon={Calendar} 
          colorClass="text-teal-500" 
          bgClass="bg-teal-50"
          subtitle="Proyección mensual"
          delay="0.5s"
        />
        <StatCard 
          title="Metas (Progreso)" 
          amount={totalGoalsCurrent} 
          icon={Target} 
          colorClass="text-indigo-500" 
          bgClass="bg-indigo-50"
          subtitle={`De $${totalGoalsTarget.toFixed(2)} objetivo`}
          delay="0.6s"
        />
      </div>
    </div>
  );
}
