import { useState, useEffect } from 'react';

const STORAGE_KEY = 'finance_app_data';

const initialData = {
  transactions: [],
  goals: [],
  subscriptions: []
};

export function useFinance() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Migration for existing data without subscriptions
    const parsed = saved ? JSON.parse(saved) : initialData;
    if (!parsed.subscriptions) parsed.subscriptions = [];
    return parsed;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: transaction.date || new Date().toISOString(),
      amount: parseFloat(transaction.amount)
    };
    
    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
  };

  const deleteTransaction = (id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));
  };

  const addGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: crypto.randomUUID(),
      targetAmount: parseFloat(goal.targetAmount),
      currentAmount: parseFloat(goal.currentAmount || 0)
    };
    setData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const updateGoal = (id, amount) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === id ? { ...g, currentAmount: parseFloat(amount) } : g
      )
    }));
  };

  const deleteGoal = (id) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));
  };

  const addSubscription = (subscription) => {
    const newSubscription = {
      ...subscription,
      id: crypto.randomUUID(),
      amount: parseFloat(subscription.amount),
      dueDay: parseInt(subscription.dueDay)
    };
    setData(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, newSubscription]
    }));
  };

  const deleteSubscription = (id) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s.id !== id)
    }));
  };

  const getBalance = () => {
    return data.transactions.reduce((acc, curr) => {
      return curr.type === 'income' 
        ? acc + curr.amount 
        : acc - curr.amount;
    }, 0);
  };

  const getIncome = () => {
    return data.transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  const getExpenses = () => {
    return data.transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
  };

  return {
    transactions: data.transactions,
    goals: data.goals,
    subscriptions: data.subscriptions,
    addTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    addSubscription,
    deleteSubscription,
    stats: {
      balance: getBalance(),
      income: getIncome(),
      expenses: getExpenses()
    }
  };
}
