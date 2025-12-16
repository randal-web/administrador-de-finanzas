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

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Error checking session:', error);
        setLoading(false);
        return;
      }
      
      const session = data?.session;
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
        goals: (goals || []).map(g => ({
          ...g,
          targetAmount: g.target_amount,
          currentAmount: g.current_amount
        })),
        subscriptions: (subscriptions || []).map(s => ({
          ...s,
          dueDay: s.due_day
        }))
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
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));

    if (user && supabase) {
      const { error } = await supabase.from('transactions').insert([{
        id: newTransaction.id,
        description: newTransaction.description,
        amount: newTransaction.amount,
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date,
        user_id: user.id
      }]);

      if (error) {
        console.error('Error adding transaction:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const deleteTransaction = async (id) => {
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id)
    }));

    if (user && supabase) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      
      if (error) {
        console.error('Error deleting transaction:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const addGoal = async (goal) => {
    const newGoal = {
      ...goal,
      id: crypto.randomUUID(),
      targetAmount: parseFloat(goal.targetAmount),
      currentAmount: parseFloat(goal.currentAmount || 0)
    };
    
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));

    if (user && supabase) {
      const { error } = await supabase.from('goals').insert([{
        id: newGoal.id,
        name: newGoal.name,
        target_amount: newGoal.targetAmount,
        current_amount: newGoal.currentAmount,
        user_id: user.id
      }]);

      if (error) {
        console.error('Error adding goal:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const updateGoal = async (id, amount) => {
    const numAmount = parseFloat(amount);
    const previousData = { ...data };
    
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === id ? { ...g, currentAmount: numAmount } : g
      )
    }));

    if (user && supabase) {
      const { error } = await supabase.from('goals').update({ current_amount: numAmount }).eq('id', id);

      if (error) {
        console.error('Error updating goal:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const addGoalContribution = async (id, amount) => {
    const contribution = parseFloat(amount);
    if (isNaN(contribution) || contribution <= 0) return { error: 'Monto inválido' };

    const goal = data.goals.find(g => g.id === id);
    if (!goal) return { error: 'Meta no encontrada' };

    const newCurrentAmount = (goal.currentAmount || 0) + contribution;
    const previousData = { ...data };

    // Optimistic update
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => 
        g.id === id ? { ...g, currentAmount: newCurrentAmount } : g
      )
    }));

    if (user && supabase) {
      const { error } = await supabase.from('goals').update({ current_amount: newCurrentAmount }).eq('id', id);

      if (error) {
        console.error('Error updating goal:', error);
        setData(previousData);
        return { error };
      }

      // Auto-create transaction for the contribution
      await addTransaction({
        description: `Aporte a meta: ${goal.name}`,
        amount: contribution,
        type: 'expense',
        category: 'Ahorro',
        date: new Date().toISOString()
      });
    }
    return { error: null };
  };

  const deleteGoal = async (id) => {
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== id)
    }));

    if (user && supabase) {
      const { error } = await supabase.from('goals').delete().eq('id', id);

      if (error) {
        console.error('Error deleting goal:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const addSubscription = async (subscription) => {
    const newSubscription = {
      ...subscription,
      id: crypto.randomUUID(),
      amount: parseFloat(subscription.amount),
      dueDay: parseInt(subscription.dueDay)
    };

    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, newSubscription]
    }));

    if (user && supabase) {
      const { error } = await supabase.from('subscriptions').insert([{
        id: newSubscription.id,
        name: newSubscription.name,
        amount: newSubscription.amount,
        due_day: newSubscription.dueDay,
        user_id: user.id
      }]);

      if (error) {
        console.error('Error adding subscription:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const deleteSubscription = async (id) => {
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.filter(s => s.id !== id)
    }));

    if (user && supabase) {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id);

      if (error) {
        console.error('Error deleting subscription:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
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

  const getSavings = () => {
    return data.transactions
      .filter(t => t.type === 'expense' && (t.category === 'Ahorro' || t.category === 'Inversión'))
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
    addGoalContribution,
    deleteGoal,
    addSubscription,
    deleteSubscription,
    stats: {
      balance: getBalance(),
      income: getIncome(),
      expenses: getExpenses(),
      savings: getSavings()
    }
  };
}
