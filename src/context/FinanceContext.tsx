'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Transaction, 
  Account, 
  Category, 
  Budget, 
  AiConfig, 
  UserProfile, 
  TransactionType,
  UserPlan 
} from '@/types/finance';
import { 
  DEFAULT_ACCOUNTS, 
  DEFAULT_CATEGORIES, 
  getInitialTransactions 
} from '@/lib/initialData';
import { parseGoogleJwt } from '@/lib/googleAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const SUPERADMIN_EMAIL = 'naufalfaster@gmail.com';

interface FinanceContextType {
  // Auth state
  user: UserProfile | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  userPlan: UserPlan;
  isLoading: boolean;
  googleClientId: string;
  isCloudConnected: boolean;
  showPlanModal: boolean;
  setShowPlanModal: (show: boolean) => void;
  setUserPlan: (plan: UserPlan) => void;
  loginWithGoogleCredential: (token: string) => boolean;
  loginAsDemo: () => void;
  loginAsAdmin: () => void;
  logout: () => void;

  // Data state (Isolated per user)
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  budgets: Budget[];
  aiConfig: AiConfig;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  updateBudget: (category: string, limit: number) => void;
  updateAiConfig: (config: Partial<AiConfig>) => void;

  // Filters
  filterPeriod: 'today' | 'this_week' | 'this_month' | 'all';
  setFilterPeriod: (period: 'today' | 'this_week' | 'this_month' | 'all') => void;
  filterType: 'all' | TransactionType;
  setFilterType: (type: 'all' | TransactionType) => void;
  filterCategory: string;
  setFilterCategory: (cat: string) => void;
  filterAccount: string;
  setFilterAccount: (acc: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Computed metrics
  filteredTransactions: Transaction[];
  totalBalance: number;
  totalIncomeMonth: number;
  totalExpenseMonth: number;
  netCashFlowMonth: number;
  categoryExpensesMonth: { category: string; amount: number; color: string; percentage: number }[];

  // Data management
  exportToCsv: () => void;
  exportToJson: () => void;
  importFromJson: (jsonData: string) => boolean;
  resetToDefault: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'catatankeuangan_active_user',
  PLAN: (uid: string) => `catatankeuangan_plan_${uid}`,
  TRANSACTIONS: (uid: string) => `catatankeuangan_tx_${uid}`,
  ACCOUNTS: (uid: string) => `catatankeuangan_acc_${uid}`,
  CATEGORIES: (uid: string) => `catatankeuangan_cat_${uid}`,
  BUDGETS: (uid: string) => `catatankeuangan_budgets_${uid}`,
  AI_CONFIG: 'catatankeuangan_ai_config',
};

const DEFAULT_AI_CONFIG: AiConfig = {
  provider: 'gemini',
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  geminiModel: 'gemini-1.5-flash',
  customEndpoint: process.env.NEXT_PUBLIC_AI_ENDPOINT || '',
  customAuthToken: process.env.NEXT_PUBLIC_AI_AUTH_TOKEN || '',
  customModel: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-4o-mini',
};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Core Data (strictly scoped per user ID)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [aiConfig, setAiConfig] = useState<AiConfig>(DEFAULT_AI_CONFIG);

  // Filters
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'this_week' | 'this_month' | 'all'>('this_month');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  const isCloudConnected = isSupabaseConfigured;

  const isSuperAdmin = Boolean(
    user && user.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
  );

  const userPlan: UserPlan = useMemo(() => {
    if (isSuperAdmin) return 'pro';
    return user?.plan || 'free';
  }, [isSuperAdmin, user?.plan]);

  // Load user data on startup (isolated per 1 akun 1 catatan)
  const loadScopedData = useCallback((activeUser: UserProfile) => {
    if (typeof window === 'undefined') return;
    const uid = activeUser.id;

    // Load Plan
    const savedPlan = localStorage.getItem(STORAGE_KEYS.PLAN(uid)) as UserPlan | null;
    const resolvedPlan: UserPlan = activeUser.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
      ? 'pro'
      : (savedPlan || activeUser.plan || 'free');
    
    setUser((prev) => (prev ? { ...prev, plan: resolvedPlan } : activeUser));

    // Load Transactions
    const savedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS(uid));
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch {
        setTransactions(getInitialTransactions(uid));
      }
    } else {
      const initial = getInitialTransactions(uid);
      setTransactions(initial);
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS(uid), JSON.stringify(initial));
    }

    // Load Accounts
    const savedAcc = localStorage.getItem(STORAGE_KEYS.ACCOUNTS(uid));
    if (savedAcc) {
      try {
        setAccounts(JSON.parse(savedAcc));
      } catch {
        setAccounts(DEFAULT_ACCOUNTS);
      }
    } else {
      setAccounts(DEFAULT_ACCOUNTS);
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS(uid), JSON.stringify(DEFAULT_ACCOUNTS));
    }

    // Load Categories
    const savedCat = localStorage.getItem(STORAGE_KEYS.CATEGORIES(uid));
    if (savedCat) {
      try {
        setCategories(JSON.parse(savedCat));
      } catch {
        setCategories(DEFAULT_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }

    // Load Budgets
    const savedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS(uid));
    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets));
      } catch {
        setBudgets([]);
      }
    } else {
      setBudgets([]);
    }
  }, []);

  // Initialize from LocalStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load AI Config
    const savedAi = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    if (savedAi) {
      try {
        setAiConfig({ ...DEFAULT_AI_CONFIG, ...JSON.parse(savedAi) });
      } catch {}
    }

    // Load Active User
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
        loadScopedData(u);
      } catch {
        const defaultAdmin: UserProfile = {
          id: 'admin-naufal',
          name: 'Naufal Irfansyah (Superadmin)',
          email: SUPERADMIN_EMAIL,
          picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          plan: 'pro',
          role: 'admin',
        };
        setUser(defaultAdmin);
        loadScopedData(defaultAdmin);
      }
    } else {
      // Default to Superadmin user directly
      const defaultAdmin: UserProfile = {
        id: 'admin-naufal',
        name: 'Naufal Irfansyah (Superadmin)',
        email: SUPERADMIN_EMAIL,
        picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        plan: 'pro',
        role: 'admin',
      };
      setUser(defaultAdmin);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultAdmin));
      loadScopedData(defaultAdmin);
    }

    setIsLoading(false);
  }, [loadScopedData]);

  // Set User Plan (Free vs Pro)
  const setUserPlan = useCallback((plan: UserPlan) => {
    if (!user) return;
    const updated = { ...user, plan };
    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.PLAN(user.id), plan);
    }
  }, [user]);

  // Save changes to LocalStorage helper
  const persistTransactions = (newTx: Transaction[]) => {
    setTransactions(newTx);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS(user.id), JSON.stringify(newTx));
    }
  };

  const persistAccounts = (newAcc: Account[]) => {
    setAccounts(newAcc);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS(user.id), JSON.stringify(newAcc));
    }
  };

  // Google Login handler
  const loginWithGoogleCredential = useCallback((credentialToken: string): boolean => {
    const payload = parseGoogleJwt(credentialToken);
    if (!payload || !payload.email) return false;

    const isAdmin = payload.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();

    const loggedUser: UserProfile = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      plan: isAdmin ? 'pro' : 'free',
      role: isAdmin ? 'admin' : 'user',
    };

    setUser(loggedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedUser));
    }
    loadScopedData(loggedUser);
    
    // Popup Pro vs Free selection on login!
    setShowPlanModal(true);
    return true;
  }, [loadScopedData]);

  const loginAsDemo = useCallback(() => {
    const demoUser: UserProfile = {
      id: 'demo-user-guest',
      name: 'Pengguna Tamu (Demo)',
      email: 'tamu@catatankeuangan.id',
      picture: '',
      plan: 'free',
      role: 'user',
    };
    setUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
    }
    loadScopedData(demoUser);
    setShowPlanModal(true);
  }, [loadScopedData]);

  const loginAsAdmin = useCallback(() => {
    const adminUser: UserProfile = {
      id: 'admin-naufal',
      name: 'Naufal Irfansyah (Superadmin)',
      email: SUPERADMIN_EMAIL,
      picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      plan: 'pro',
      role: 'admin',
    };
    setUser(adminUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(adminUser));
    }
    loadScopedData(adminUser);
    setShowPlanModal(true);
  }, [loadScopedData]);

  const logout = useCallback(() => {
    setUser(null);
    setTransactions([]);
    setAccounts([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, []);

  // Transaction CRUD
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'created_at' | 'user_id'>): Promise<Transaction> => {
    const uid = user ? user.id : 'demo-user';

    // Free plan check: max 50 transactions
    if (userPlan === 'free' && transactions.length >= 50) {
      setShowPlanModal(true);
      throw new Error('Batas 50 transaksi gratis telah tercapai. Aktifkan Mode PRO untuk pencatatan tanpa batas!');
    }

    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: uid,
      created_at: new Date().toISOString(),
    };

    // Update account balances automatically
    const updatedAccounts = accounts.map((acc) => {
      if (newTx.type === 'expense' && acc.id === newTx.account_id) {
        return { ...acc, balance: acc.balance - newTx.amount };
      }
      if (newTx.type === 'income' && acc.id === newTx.account_id) {
        return { ...acc, balance: acc.balance + newTx.amount };
      }
      if (newTx.type === 'transfer') {
        if (acc.id === newTx.account_id) {
          return { ...acc, balance: acc.balance - newTx.amount };
        }
        if (acc.id === newTx.to_account_id) {
          return { ...acc, balance: acc.balance + newTx.amount };
        }
      }
      return acc;
    });

    const newTxList = [newTx, ...transactions];
    persistTransactions(newTxList);
    persistAccounts(updatedAccounts);

    // Sync to Supabase in background if configured
    if (supabase && user) {
      supabase.from('transactions').insert([newTx]).then(() => {}, console.warn);
    }

    return newTx;
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const updatedList = transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
    persistTransactions(updatedList);
  };

  const deleteTransaction = async (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    // Reverse balance effect
    const updatedAccounts = accounts.map((acc) => {
      if (target.type === 'expense' && acc.id === target.account_id) {
        return { ...acc, balance: acc.balance + target.amount };
      }
      if (target.type === 'income' && acc.id === target.account_id) {
        return { ...acc, balance: acc.balance - target.amount };
      }
      if (target.type === 'transfer') {
        if (acc.id === target.account_id) {
          return { ...acc, balance: acc.balance + target.amount };
        }
        if (acc.id === target.to_account_id) {
          return { ...acc, balance: acc.balance - target.amount };
        }
      }
      return acc;
    });

    const updatedList = transactions.filter((t) => t.id !== id);
    persistTransactions(updatedList);
    persistAccounts(updatedAccounts);

    if (supabase && user) {
      supabase.from('transactions').delete().eq('id', id).then(() => {}, console.warn);
    }
  };

  // Account actions
  const addAccount = (accData: Omit<Account, 'id'>) => {
    if (userPlan === 'free' && accounts.length >= 3) {
      setShowPlanModal(true);
      alert('Mode Free terbatas maksimal 3 rekening/dompet. Aktifkan Mode PRO untuk menambah dompet tanpa batas!');
      return;
    }
    const newAcc: Account = {
      ...accData,
      id: `acc-${Date.now()}`,
    };
    persistAccounts([...accounts, newAcc]);
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    persistAccounts(accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAccount = (id: string) => {
    persistAccounts(accounts.filter((a) => a.id !== id));
  };

  // Budget
  const updateBudget = (category: string, limit: number) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const existing = budgets.find((b) => b.category === category && b.month === currentMonth);
    let newBudgets: Budget[];
    if (existing) {
      newBudgets = budgets.map((b) => (b.id === existing.id ? { ...b, limit_amount: limit } : b));
    } else {
      newBudgets = [...budgets, { id: `bgt-${Date.now()}`, category, limit_amount: limit, month: currentMonth }];
    }
    setBudgets(newBudgets);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BUDGETS(user.id), JSON.stringify(newBudgets));
    }
  };

  // AI Config
  const updateAiConfig = (updates: Partial<AiConfig>) => {
    const newConfig = { ...aiConfig, ...updates };
    setAiConfig(newConfig);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AI_CONFIG, JSON.stringify(newConfig));
    }
  };

  // Computations
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }, [accounts]);

  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(currentMonthPrefix));
  }, [transactions, currentMonthPrefix]);

  const totalIncomeMonth = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpenseMonth = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const netCashFlowMonth = totalIncomeMonth - totalExpenseMonth;

  // Category breakdown
  const categoryExpensesMonth = useMemo(() => {
    const catMap = new Map<string, number>();
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
      });

    const total = Array.from(catMap.values()).reduce((a, b) => a + b, 0) || 1;
    const items = Array.from(catMap.entries()).map(([catName, amount]) => {
      const matchCat = categories.find((c) => c.name === catName);
      return {
        category: catName,
        amount,
        color: matchCat?.color || '#3B82F6',
        percentage: Math.round((amount / total) * 100),
      };
    });

    return items.sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, categories]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

    return transactions.filter((t) => {
      if (filterPeriod === 'today' && t.date !== todayStr) return false;
      if (filterPeriod === 'this_week' && t.date < startOfWeekStr) return false;
      if (filterPeriod === 'this_month' && !t.date.startsWith(currentMonthPrefix)) return false;
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (filterAccount !== 'all' && t.account_id !== filterAccount && t.to_account_id !== filterAccount) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNote = t.note.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        const matchAcc = t.account_name.toLowerCase().includes(q);
        const matchAmount = t.amount.toString().includes(q);
        if (!matchNote && !matchCat && !matchAcc && !matchAmount) return false;
      }

      return true;
    });
  }, [transactions, filterPeriod, filterType, filterCategory, filterAccount, searchQuery, currentMonthPrefix]);

  // Export / Import
  const exportToCsv = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Nominal', 'Akun', 'Tujuan Transfer', 'Keterangan'];
    const rows = transactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.category}"`,
      t.amount,
      `"${t.account_name}"`,
      `"${t.to_account_name || ''}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Catatan_Keuangan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJson = () => {
    const data = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      user,
      transactions,
      accounts,
      categories,
      budgets,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `Backup_Catatan_Keuangan_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (Array.isArray(parsed.transactions)) {
        persistTransactions(parsed.transactions);
      }
      if (Array.isArray(parsed.accounts)) {
        persistAccounts(parsed.accounts);
      }
      if (Array.isArray(parsed.categories)) {
        setCategories(parsed.categories);
      }
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  };

  const resetToDefault = () => {
    if (!confirm('Yakin ingin mereset data transaksi ke contoh bawaan akun ini?')) return;
    const uid = user?.id || 'demo-user';
    const initTx = getInitialTransactions(uid);
    persistTransactions(initTx);
    persistAccounts(DEFAULT_ACCOUNTS);
  };

  return (
    <FinanceContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isSuperAdmin,
        userPlan,
        isLoading,
        googleClientId,
        isCloudConnected,
        showPlanModal,
        setShowPlanModal,
        setUserPlan,
        loginWithGoogleCredential,
        loginAsDemo,
        loginAsAdmin,
        logout,
        transactions,
        accounts,
        categories,
        budgets,
        aiConfig,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addAccount,
        updateAccount,
        deleteAccount,
        updateBudget,
        updateAiConfig,
        filterPeriod,
        setFilterPeriod,
        filterType,
        setFilterType,
        filterCategory,
        setFilterCategory,
        filterAccount,
        setFilterAccount,
        searchQuery,
        setSearchQuery,
        filteredTransactions,
        totalBalance,
        totalIncomeMonth,
        totalExpenseMonth,
        netCashFlowMonth,
        categoryExpensesMonth,
        exportToCsv,
        exportToJson,
        importFromJson,
        resetToDefault,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance harus digunakan di dalam FinanceProvider');
  }
  return context;
}
