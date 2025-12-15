import { useState } from 'react';
import { LayoutDashboard, PlusCircle, History as HistoryIcon, Target, Menu, X } from 'lucide-react';
import { useFinance } from './hooks/useFinance';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { History } from './components/History';
import { Goals } from './components/Goals';

function App() {
  const { 
    transactions, 
    goals, 
    addTransaction, 
    deleteTransaction, 
    addGoal, 
    updateGoal, 
    deleteGoal,
    stats 
  } = useFinance();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} transactions={transactions} />;
      case 'transactions':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TransactionForm onAdd={addTransaction} />
            </div>
            <div className="lg:col-span-2">
              <History transactions={transactions} onDelete={deleteTransaction} />
            </div>
          </div>
        );
      case 'goals':
        return (
          <Goals 
            goals={goals} 
            onAdd={addGoal} 
            onUpdate={updateGoal} 
            onDelete={deleteGoal} 
          />
        );
      default:
        return <Dashboard stats={stats} transactions={transactions} />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1 rounded">AF</span> Finanzas
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="transactions" icon={PlusCircle} label="Transacciones" />
          <NavItem id="goals" icon={Target} label="Metas" />
        </nav>
        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          v1.0.0 - Personal Finance
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-blue-600">Finanzas Personales</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-50 z-10" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-4 space-y-2 pt-20" onClick={e => e.stopPropagation()}>
            <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem id="transactions" icon={PlusCircle} label="Transacciones" />
            <NavItem id="goals" icon={Target} label="Metas" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 capitalize">
            {activeTab === 'dashboard' ? 'Resumen General' : 
             activeTab === 'transactions' ? 'Gestión de Transacciones' : 'Mis Metas'}
          </h2>
          <p className="text-gray-500">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}

export default App;
