import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'finance_app_data';

const initialData = {
  transactions: [],
  goals: [],
  subscriptions: []
};

export function useFinance() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : initialData;
    if (!parsed.subscriptions) parsed.subscriptions = [];
    return parsed;
  });

  // Check for user session
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchData(session.user.id);
      } else {
        // Fallback to local storage if logged out
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : initialData;
        if (!parsed.subscriptions) parsed.subscriptions = [];
        setData(parsed);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync to LocalStorage only if NOT logged in (or as backup)
  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, user]);

  const fetchData = async (userId) => {
    try {
      setLoading(true);
      const [ { data: transactions }, { data: goals }, { data: subscriptions } ] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('subscriptions').select('*').eq('user_id', userId)
      ]);

      setData({
        transactions: transactions || [],
        goals: goals || [],
        subscriptions: subscriptions || []
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
      date: transaction.date || new Date().toISOString(),
      amount: parseFloat(transaction.amount)
    };

    // Optimistic update
    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));

    if (user && supabase) {
      await supabase.from('transactions').insert([{
        ...newTransaction,
        user_id: user.id
      }]);
    }
  };

  const deleteTransaction = async (id) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));

    if (user && supabase) {
      await supabase.from('transactions').delete().eq('id', id);
    }
  };

  const addGoal = async (goal) => {
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

    if (user && supabase) {
      await supabase.from('goals').insert([{
        ...newGoal,
        user_id: user.id,
        target_amount: newGoal.targetAmount, // Snake case for DB
        current_amount: newGoal.currentAmount
      }]);
    }
  };

  const updateGoal = async (id, amount) => {
    const numAmount = parseFloat(amount);
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === id ? { ...g, currentAmount: numAmount } : g
      )
    }));

    if (user && supabase) {
      await supabase.from('goals').update({ current_amount: numAmount }).eq('id', id);
    }
  };

  const deleteGoal = async (id) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));

    if (user && supabase) {
      await supabase.from('goals').delete().eq('id', id);
    }
  };

  const addSubscription = async (subscription) => {
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

    if (user && supabase) {
      await supabase.from('subscriptions').insert([{
        ...newSubscription,
        user_id: user.id,
        due_day: newSubscription.dueDay
      }]);
    }
  };

  const deleteSubscription = async (id) => {
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s.id !== id)
    }));

    if (user && supabase) {
      await supabase.from('subscriptions').delete().eq('id', id);
    }
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
    user,
    loading,
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
