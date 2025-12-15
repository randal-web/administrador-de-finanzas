import { useState, useEffect } from 'react';
import { LayoutDashboard, Target, Plus, X, Wallet, Moon, Sun, Calendar } from 'lucide-react';
import { useFinance } from './hooks/useFinance';
import { Dashboard } from './components/Dashboard';
import { Goals } from './components/Goals';
import { Subscriptions } from './components/Subscriptions';
import { TransactionForm } from './components/TransactionForm';

const NavSwitch = ({ activeTab, setActiveTab }) => (
  <div className="relative flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-full transition-colors duration-300">
    <div 
      className={`absolute top-1 bottom-1 rounded-full bg-white dark:bg-neutral-700 shadow-sm ring-1 ring-slate-200 dark:ring-neutral-600 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] ${
        activeTab === 'transactions' ? 'left-1 w-[32%]' : activeTab === 'goals' ? 'left-[34%] w-[32%]' : 'left-[67%] right-1'
      }`}
    />
    <button
      onClick={() => setActiveTab('transactions')}
      className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        activeTab === 'transactions' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
      }`}
    >
      <LayoutDashboard size={18} />
      <span className="hidden sm:inline">Dashboard</span>
    </button>
    <button
      onClick={() => setActiveTab('goals')}
      className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        activeTab === 'goals' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
      }`}
    >
      <Target size={18} />
      <span className="hidden sm:inline">Metas</span>
    </button>
    <button
      onClick={() => setActiveTab('subscriptions')}
      className={`relative z-10 flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
        activeTab === 'subscriptions' ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
      }`}
    >
      <Calendar size={18} />
      <span className="hidden sm:inline">Pagos</span>
    </button>
  </div>
);

function App() {
  const { 
    transactions, 
    goals,
    subscriptions,
    addTransaction, 
    deleteTransaction, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    addSubscription,
    deleteSubscription,
    stats 
  } = useFinance();

  const [activeTab, setActiveTab] = useState('transactions');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const renderContent = () => {
    let content;
    
    if (activeTab === 'transactions') {
      content = (
        <Dashboard 
          stats={stats} 
          transactions={transactions} 
          onDelete={deleteTransaction} 
        />
      );
    } else if (activeTab === 'goals') {
      content = (
        <Goals 
          goals={goals} 
          onAdd={addGoal} 
          onUpdate={updateGoal} 
          onDelete={deleteGoal} 
        />
      );
    } else {
      content = (
        <Subscriptions 
          subscriptions={subscriptions} 
          onAdd={addSubscription} 
          onDelete={deleteSubscription} 
        />
      );
    }

    return (
      <div key={activeTab} className="animate-slide-up">
        {content}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-neutral-950 flex flex-col font-sans text-slate-900 dark:text-neutral-100 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="sticky top-4 z-30 mx-4 md:mx-8 mt-4">
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/20 dark:border-neutral-800/50 px-6 py-4 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div className="flex-shrink-0 flex items-center gap-3">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
                  <LayoutDashboard size={20} className="text-white" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-neutral-100 dark:to-neutral-300">
                  Finanzas
                </span>
              </div>
              
              <div className="hidden md:block">
                <NavSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={() => setIsTransactionModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 dark:hover:bg-blue-500 transition-all duration-300 font-medium shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Nueva Transacción</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex justify-center mt-4">
          <NavSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <header className="mb-10 px-2">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white capitalize tracking-tight">
            {activeTab === 'transactions' ? 'Resumen General' : activeTab === 'goals' ? 'Mis Metas' : 'Pagos Recurrentes'}
          </h2>
          <p className="text-slate-500 dark:text-neutral-400 mt-1 font-medium">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {renderContent()}
      </main>

      {/* Transaction Modal */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm transition-all duration-300" onClick={() => setIsTransactionModalOpen(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgb(0,0,0,0.5)] w-full max-w-md overflow-hidden border border-white/50 dark:border-neutral-800" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-slate-50 dark:border-neutral-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Agregar Transacción</h3>
              <button onClick={() => setIsTransactionModalOpen(false)} className="p-2 hover:bg-slate-50 dark:hover:bg-neutral-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <TransactionForm onAdd={(t) => {
                addTransaction(t);
                setIsTransactionModalOpen(false);
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
