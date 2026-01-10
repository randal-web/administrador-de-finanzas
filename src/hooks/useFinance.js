import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'finance_app_data';

const initialData = {
  transactions: [],
  goals: [],
  subscriptions: [],
  debts: [],
  expectedIncome: []
};

export function useFinance() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dataLoadedRef = useRef(false);
  const lastFetchedUserId = useRef(null);
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : initialData;
    if (!parsed.subscriptions) parsed.subscriptions = [];
    if (!parsed.debts) parsed.debts = [];
    if (!parsed.expectedIncome) parsed.expectedIncome = [];
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
        // If the session is invalid (e.g. invalid refresh token), sign out to clear it
        supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }
      
      const session = data?.session;
      
      // Check for session expiry
      const expiry = localStorage.getItem('session_expiry');
      if (expiry && Date.now() > parseInt(expiry)) {
        supabase.auth.signOut();
        localStorage.removeItem('session_expiry');
        setUser(null);
        setLoading(false);
        dataLoadedRef.current = false;
        lastFetchedUserId.current = null;
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        if (session.user.id !== lastFetchedUserId.current) {
          fetchData(session.user.id);
          lastFetchedUserId.current = session.user.id;
        }
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Check for session expiry on auth state change as well
      const expiry = localStorage.getItem('session_expiry');
      if (expiry && Date.now() > parseInt(expiry)) {
        supabase.auth.signOut();
        localStorage.removeItem('session_expiry');
        setUser(null);
        setLoading(false);
        dataLoadedRef.current = false;
        lastFetchedUserId.current = null;
        return;
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        // Avoid refetching on token refresh or if user hasn't changed
        if (event !== 'TOKEN_REFRESHED' && session.user.id !== lastFetchedUserId.current) {
          fetchData(session.user.id);
          lastFetchedUserId.current = session.user.id;
        }
      } else {
        // Fallback to local storage if logged out
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : initialData;
        if (!parsed.subscriptions) parsed.subscriptions = [];
        if (!parsed.debts) parsed.debts = [];
        if (!parsed.expectedIncome) parsed.expectedIncome = [];
        setData(parsed);
        setLoading(false);
        dataLoadedRef.current = false;
        lastFetchedUserId.current = null;
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
      if (!dataLoadedRef.current) setLoading(true);
      const [ { data: transactions }, { data: goals }, { data: subscriptions }, { data: debts }, { data: expectedIncome }, { data: subscriptionPayments } ] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', userId),
        supabase.from('subscriptions').select('*').eq('user_id', userId),
        supabase.from('debts').select('*').eq('user_id', userId),
        supabase.from('expected_income').select('*').eq('user_id', userId),
        supabase.from('subscription_payments').select('*').eq('user_id', userId).order('payment_date', { ascending: false })
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
          dueDay: s.due_day,
          frequency: s.frequency || 'monthly',
          date: s.due_date,
          lastPaymentDate: s.last_payment_date,
          payments: (subscriptionPayments || [])
            .filter(p => p.subscription_id === s.id)
            .map(p => ({
              id: p.id,
              amount: p.amount,
              date: p.payment_date
            }))
        })),
        debts: debts || [],
        expectedIncome: expectedIncome || []
      });
      dataLoadedRef.current = true;
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
      amount: parseFloat(transaction.amount),
      debt_id: transaction.debtId // Ensure local state has snake_case for filtering
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
        debt_id: transaction.debtId || null,
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
      dueDay: subscription.dueDay ? parseInt(subscription.dueDay) : null,
      frequency: subscription.frequency || 'monthly',
      date: subscription.date || null,
      debt_id: subscription.debtId || null
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
        frequency: newSubscription.frequency,
        due_date: newSubscription.date,
        user_id: user.id,
        debt_id: subscription.debtId || null
      }]);

      if (error) {
        console.error('Error adding subscription:', error.message, error.details);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const updateSubscription = async (id, updates) => {
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => 
        s.id === id ? { ...s, ...updates } : s
      )
    }));

    if (user && supabase) {
      const dbUpdates = {};
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.lastPaymentDate !== undefined) dbUpdates.last_payment_date = updates.lastPaymentDate;

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await supabase
          .from('subscriptions')
          .update(dbUpdates)
          .eq('id', id);

        if (error) {
          console.error('Error updating subscription:', error);
          setData(previousData);
          return { error };
        }
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

  const paySubscription = async (id, amount, date) => {
    const paymentDate = date || new Date().toISOString();
    const numAmount = parseFloat(amount);
    
    const previousData = { ...data };
    
    // Optimistic update
    setData(prev => ({
      ...prev,
      subscriptions: prev.subscriptions.map(s => {
        if (s.id === id) {
          return {
            ...s,
            lastPaymentDate: paymentDate,
            payments: [
              { id: 'temp-' + Date.now(), amount: numAmount, date: paymentDate },
              ...(s.payments || [])
            ]
          };
        }
        return s;
      })
    }));

    if (user && supabase) {
      // 1. Insert payment record
      const { error: paymentError } = await supabase
        .from('subscription_payments')
        .insert([{
          subscription_id: id,
          user_id: user.id,
          amount: numAmount,
          payment_date: paymentDate
        }]);

      if (paymentError) {
        console.error('Error adding subscription payment:', paymentError);
        setData(previousData);
        return { error: paymentError };
      }

      // 2. Update subscription last_payment_date
      const { error: subError } = await supabase
        .from('subscriptions')
        .update({ last_payment_date: paymentDate })
        .eq('id', id);

      if (subError) {
        console.error('Error updating subscription last payment:', subError);
        setData(previousData);
        return { error: subError };
      }
    }
    return { error: null };
  };

  const addDebt = async (debt) => {
    const newDebt = {
      ...debt,
      id: crypto.randomUUID(),
      amount: parseFloat(debt.amount),
      date: debt.date || new Date().toISOString().split('T')[0],
      type: debt.type || 'personal'
    };

    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      debts: [...prev.debts, newDebt]
    }));

    if (user && supabase) {
      const { error } = await supabase.from('debts').insert([{
        id: newDebt.id,
        name: newDebt.name,
        amount: newDebt.amount,
        date: newDebt.date,
        type: newDebt.type,
        user_id: user.id
      }]);

      if (error) {
        console.error('Error adding debt:', error);
        setData(previousData);
        return { error };
      }
    }
    return { data: newDebt, error: null };
  };

  const increaseDebt = async (id, amount) => {
    const increaseAmount = parseFloat(amount);
    const debt = data.debts.find(d => d.id === id);
    if (!debt) return { error: 'Debt not found' };

    const newAmount = debt.amount + increaseAmount;
    const previousData = { ...data };

    setData(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === id ? { ...d, amount: newAmount } : d)
    }));

    if (user && supabase) {
      const { error } = await supabase
        .from('debts')
        .update({ amount: newAmount })
        .eq('id', id);

      if (error) {
        console.error('Error increasing debt:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const payDebt = async (id, amount, date) => {
    const paymentAmount = parseFloat(amount);
    const paymentDate = date || new Date().toISOString();
    const debt = data.debts.find(d => d.id === id);
    if (!debt) return { error: 'Debt not found' };

    const newAmount = Math.max(0, debt.amount - paymentAmount);
    const previousData = { ...data };

    setData(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === id ? { ...d, amount: newAmount } : d)
    }));

    if (user && supabase) {
      const { error } = await supabase
        .from('debts')
        .update({ amount: newAmount })
        .eq('id', id);

      if (error) {
        console.error('Error updating debt:', error);
        setData(previousData);
        return { error };
      }

      // Auto-create transaction for the debt payment
      await addTransaction({
        description: `Abono a deuda: ${debt.name}`,
        amount: paymentAmount,
        type: 'expense',
        category: 'Deudas',
        date: paymentDate,
        debtId: id
      });
    }
    return { error: null };
  };

  const deleteDebt = async (id) => {
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      debts: prev.debts.filter(d => d.id !== id)
    }));

    if (user && supabase) {
      const { error } = await supabase.from('debts').delete().eq('id', id);

      if (error) {
        console.error('Error deleting debt:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const addExpectedIncome = async (income) => {
    const newIncome = {
      ...income,
      id: crypto.randomUUID(),
      amount: parseFloat(income.amount),
      date: income.date || new Date().toISOString().split('T')[0]
    };

    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      expectedIncome: [...prev.expectedIncome, newIncome]
    }));

    if (user && supabase) {
      const { error } = await supabase.from('expected_income').insert([{
        id: newIncome.id,
        source: newIncome.source,
        amount: newIncome.amount,
        date: newIncome.date,
        user_id: user.id
      }]);

      if (error) {
        console.error('Error adding expected income:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const deleteExpectedIncome = async (id) => {
    const previousData = { ...data };
    setData(prev => ({
      ...prev,
      expectedIncome: prev.expectedIncome.filter(i => i.id !== id)
    }));

    if (user && supabase) {
      const { error } = await supabase.from('expected_income').delete().eq('id', id);

      if (error) {
        console.error('Error deleting expected income:', error);
        setData(previousData);
        return { error };
      }
    }
    return { error: null };
  };

  const getBalance = () => {
    return data.transactions.reduce((acc, curr) => {
      if (curr.type === 'income') {
        return acc + curr.amount;
      } else {
        // If it's an expense linked to a credit card debt, don't subtract from balance
        if (curr.debt_id || curr.debtId) {
          const debtId = curr.debt_id || curr.debtId;
          const linkedDebt = data.debts.find(d => d.id === debtId);
          if (linkedDebt && linkedDebt.type === 'credit-card') {
            return acc;
          }
        }
        return acc - curr.amount;
      }
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
    debts: data.debts,
    expectedIncome: data.expectedIncome,
    addTransaction,
    deleteTransaction,
    addGoal,
    updateGoal,
    addGoalContribution,
    deleteGoal,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    paySubscription,
    addDebt,
    payDebt,
    increaseDebt,
    deleteDebt,
    addExpectedIncome,
    deleteExpectedIncome,
    stats: {
      balance: getBalance(),
      income: getIncome(),
      expenses: getExpenses(),
      savings: getSavings()
    }
  };
}
