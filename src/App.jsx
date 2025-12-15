import { useState, useEffect } from 'react';
import { LayoutDashboard, Target, Plus, X, Wallet, Moon, Sun, Calendar, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useFinance } from './hooks/useFinance';
import { Dashboard } from './components/Dashboard';
import { Goals } from './components/Goals';
import { Subscriptions } from './components/Subscriptions';
import { TransactionForm } from './components/TransactionForm';
import { Auth } from './components/Auth';
import { supabase } from './lib/supabase';

const NavSwitch = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'transactions', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'goals', icon: Target, label: 'Metas' },
    { id: 'subscriptions', icon: Calendar, label: 'Pagos' }
  ];
  
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <div className="relative flex bg-slate-100 dark:bg-neutral-800 p-1 rounded-xl md:rounded-full transition-colors duration-300 isolate">
      <div 
        className="absolute top-1 bottom-1 bg-white dark:bg-neutral-700 shadow-sm ring-1 ring-slate-200 dark:ring-neutral-600 rounded-lg md:rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] -z-10"
        style={{
          left: '4px',
          width: 'calc((100% - 8px) / 3)',
          transform: `translateX(${activeIndex * 100}%)`
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
            activeTab === tab.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-neutral-200'
          }`}
        >
          <tab.icon size={18} />
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

function App() {
  const { 
    user,
    loading,
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
  const [showAuth, setShowAuth] = useState(false);
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

  // Close auth modal when user logs in
  useEffect(() => {
    if (user) setShowAuth(false);
  }, [user]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-neutral-950">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (showAuth && !user) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowAuth(false)}
          className="absolute top-4 right-4 p-2 bg-white dark:bg-neutral-800 rounded-full shadow-md z-50"
        >
          <X size={24} className="text-slate-500 dark:text-neutral-400" />
        </button>
        <Auth />
      </div>
    );
  }

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
      <nav className="sticky top-2 md:top-4 z-30 mx-2 md:mx-8 mt-2 md:mt-4">
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/20 dark:border-neutral-800/50 p-3 md:px-6 md:py-4 transition-colors duration-300">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex-shrink-0 flex items-center gap-2 md:gap-3">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 md:p-2 rounded-xl shadow-lg shadow-blue-500/30">
                  <LayoutDashboard size={18} className="text-white md:w-5 md:h-5" />
                </div>
                <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-neutral-100 dark:to-neutral-300">
                  Finanzas
                </span>
              </div>
              
              <div className="hidden md:block">
                <NavSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 md:p-2.5 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun size={18} className="md:w-5 md:h-5" /> : <Moon size={18} className="md:w-5 md:h-5" />}
              </button>

              <button
                onClick={() => user ? handleLogout() : setShowAuth(true)}
                className="p-2 md:p-2.5 rounded-full text-slate-500 dark:text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
                title={user ? "Cerrar Sesión" : "Iniciar Sesión"}
              >
                {user ? <LogOut size={18} className="md:w-5 md:h-5" /> : <LogIn size={18} className="md:w-5 md:h-5" />}
              </button>

              <button
                onClick={() => setIsTransactionModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 dark:bg-blue-600 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-full hover:bg-slate-800 dark:hover:bg-blue-500 transition-all duration-300 font-medium shadow-lg shadow-slate-900/20 dark:shadow-blue-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
              >
                <Plus size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Nueva Transacción</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex justify-center mt-2">
          <div className="w-full max-w-sm bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 dark:border-neutral-800/50 p-1">
            <NavSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <header className="mb-6 md:mb-10 px-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white capitalize tracking-tight">
            {activeTab === 'transactions' ? 'Resumen General' : activeTab === 'goals' ? 'Mis Metas' : 'Pagos Recurrentes'}
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-neutral-400 mt-1 font-medium">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {renderContent()}
      </main>

      <footer className="py-6 text-center">
        <p className="text-xs font-medium text-slate-400 dark:text-neutral-600">
          Administrador de Finanzas v1.0.0
        </p>
      </footer>

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
