import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, CreditCard, Target, Calendar } from 'lucide-react';
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

export function Dashboard({ stats, transactions, goals, debts, expectedIncome, onDelete }) {
  // Datos para la gráfica de barras
  const chartData = [
    { name: 'Ingresos', value: stats.income, color: '#34d399' }, // emerald-400 (softer)
    { name: 'Egresos', value: stats.expenses, color: '#fb7185' }, // rose-400 (softer)
    { name: 'Ahorros', value: stats.savings, color: '#60a5fa' }, // blue-400 (softer)
  ];

  const totalDebts = debts?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const totalExpectedIncome = expectedIncome?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const totalGoalsTarget = goals?.reduce((acc, curr) => acc + curr.targetAmount, 0) || 0;
  const totalGoalsCurrent = goals?.reduce((acc, curr) => acc + curr.currentAmount, 0) || 0;

  return (
    <div className="space-y-8">
      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Balance" 
          amount={stats.balance} 
          icon={Wallet} 
          colorClass="text-slate-700 dark:text-neutral-200" 
          bgClass="bg-slate-100 dark:bg-neutral-800"
          subtitle="Saldo disponible"
          delay="0s"
        />
        <StatCard 
          title="Ingresos Totales" 
          amount={stats.income} 
          icon={TrendingUp} 
          colorClass="text-emerald-500" 
          bgClass="bg-emerald-50"
          subtitle="Ingresos reales"
          delay="0.1s"
        />
        <StatCard 
          title="Egresos Totales" 
          amount={stats.expenses} 
          icon={TrendingDown} 
          colorClass="text-rose-500" 
          bgClass="bg-rose-50"
          subtitle="Gastos reales"
          delay="0.2s"
        />
        <StatCard 
          title="Ahorros" 
          amount={stats.savings} 
          icon={PiggyBank} 
          colorClass="text-blue-500" 
          bgClass="bg-blue-50"
          subtitle="Ahorros acumulados"
          delay="0.3s"
        />
      </div>

      {/* Sección Principal: Gráfica y Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfica */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-slate-50 dark:border-neutral-800">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Resumen Financiero</h3>
            <p className="text-sm text-slate-400 dark:text-neutral-500 font-medium mt-1">Visualización de tus ingresos, egresos y ahorros</p>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
