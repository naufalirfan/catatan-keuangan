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
  UserPlan,
  MemberItem
} from '@/types/finance';

import { 
  DEFAULT_ACCOUNTS, 
  DEFAULT_CATEGORIES, 
  getInitialTransactions 
} from '@/lib/initialData';
import { parseGoogleJwt } from '@/lib/googleAuth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getUserSession, saveUserSession, clearUserSession } from '@/lib/cookies';
import * as XLSX from 'xlsx';

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
  signInWithGoogle: () => Promise<void>;
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
  exportToExcel: () => void;
  exportToJson: () => void;
  importFromJson: (jsonData: string) => boolean;
  resetToDefault: () => void;

  // Member Management (Superadmin)
  members: MemberItem[];
  updateMemberPlan: (email: string, plan: UserPlan, name?: string) => Promise<void>;
  deleteMember: (email: string) => Promise<void>;
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
  MEMBERS: 'catatankeuangan_members_registry',
  PRO_POPUP_SEEN: (uid: string) => `catatankeuangan_pro_popup_seen_${uid}`,
};


const DEFAULT_AI_CONFIG: AiConfig = {
  provider: 'custom',
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  geminiModel: 'gemini-1.5-flash',
  customEndpoint: process.env.NEXT_PUBLIC_AI_ENDPOINT || 'https://9router.naufalputra.my.id/v1',
  customAuthToken: process.env.NEXT_PUBLIC_AI_AUTH_TOKEN || 'sk-f7dc96564905d265-i8kpea-767a0d95',
  customModel: process.env.NEXT_PUBLIC_AI_MODEL || 'joo',
  customFallbackModel: process.env.NEXT_PUBLIC_AI_FALLBACK_MODEL || 'jaa',
};


export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      return getUserSession();
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window !== 'undefined' && getUserSession()) {
      return false;
    }
    return true;
  });
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [members, setMembers] = useState<MemberItem[]>([]);


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

    // Load Plan from member registry or saved plan
    const registryRaw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    const registry = registryRaw ? JSON.parse(registryRaw) : {};
    const memberEntry = registry[activeUser.email.toLowerCase()];

    const savedPlan = localStorage.getItem(STORAGE_KEYS.PLAN(uid)) as UserPlan | null;
    const resolvedPlan: UserPlan = activeUser.email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase()
      ? 'pro'
      : (memberEntry?.plan || savedPlan || activeUser.plan || 'free');
    
    setUser((prev) => (prev ? { ...prev, plan: resolvedPlan } : { ...activeUser, plan: resolvedPlan }));

    // Register user to member registry if not present
    if (!registry[activeUser.email.toLowerCase()]) {
      registry[activeUser.email.toLowerCase()] = {
        id: activeUser.id,
        email: activeUser.email.toLowerCase(),
        name: activeUser.name,
        picture: activeUser.picture || '',
        plan: resolvedPlan,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(registry));
      setMembers(Object.values(registry));
    }


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

  // Initialize from LocalStorage and Supabase Session
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load AI Config
    const savedAi = localStorage.getItem(STORAGE_KEYS.AI_CONFIG);
    if (savedAi) {
      try {
        const parsed = JSON.parse(savedAi);
        setAiConfig({
          ...DEFAULT_AI_CONFIG,
          ...parsed,
          provider: parsed.provider || 'custom',
          customEndpoint: parsed.customEndpoint?.trim() || DEFAULT_AI_CONFIG.customEndpoint,
          customAuthToken: parsed.customAuthToken?.trim() || DEFAULT_AI_CONFIG.customAuthToken,
          customModel: parsed.customModel?.trim() || DEFAULT_AI_CONFIG.customModel,
          customFallbackModel: parsed.customFallbackModel?.trim() || DEFAULT_AI_CONFIG.customFallbackModel || 'jaa',
        });
      } catch {}
    }

    // Load Members Registry from LocalStorage
    const registryRaw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (registryRaw) {
      try {
        const parsed = JSON.parse(registryRaw);
        setMembers(Object.values(parsed));
      } catch {}
    }

    // Also sync members from Supabase profiles if available
    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').select('*').then(({ data }) => {
        if (data && Array.isArray(data)) {
          const currentRaw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
          const currentRegistry = currentRaw ? JSON.parse(currentRaw) : {};
          data.forEach((p: { id?: string; email?: string; full_name?: string; name?: string; avatar_url?: string; picture?: string; plan?: string; created_at?: string }) => {
            if (p.email) {
              const emailKey = p.email.toLowerCase();
              currentRegistry[emailKey] = {
                id: p.id || `user_${emailKey.replace(/[^a-z0-9]/g, '_')}`,
                email: emailKey,
                name: p.full_name || p.name || emailKey.split('@')[0],
                picture: p.avatar_url || p.picture || '',
                plan: (p.plan as UserPlan) || currentRegistry[emailKey]?.plan || 'free',
                created_at: p.created_at || new Date().toISOString(),
              };
            }
          });
          localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(currentRegistry));
          setMembers(Object.values(currentRegistry));
        }
      }, () => {});
    }

    // Priority 1: Check Cookie Session & LocalStorage for instant login

    const cookieUser = getUserSession();
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    let activeUser: UserProfile | null = cookieUser;

    if (!activeUser && savedUser) {
      try {
        activeUser = JSON.parse(savedUser);
      } catch {}
    }

    if (activeUser) {
      setUser(activeUser);
      saveUserSession(activeUser); // Refresh 90-day cookie
      loadScopedData(activeUser);
      setIsLoading(false);
    }

    // Listen to Supabase OAuth Session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const gUser = session.user;
          const email = gUser.email || '';
          const isAdmin = email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
          const loggedUser: UserProfile = {
            id: gUser.id,
            email,
            name: gUser.user_metadata?.full_name || gUser.user_metadata?.name || email.split('@')[0] || 'User',
            picture: gUser.user_metadata?.avatar_url || gUser.user_metadata?.picture || '',
            plan: isAdmin ? 'pro' : 'free',
            role: isAdmin ? 'admin' : 'user',
          };
          setUser(loggedUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedUser));
          saveUserSession(loggedUser); // 90-day persistent cookie
          loadScopedData(loggedUser);
        }
        setIsLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const gUser = session.user;
          const email = gUser.email || '';
          const isAdmin = email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase();
          const loggedUser: UserProfile = {
            id: gUser.id,
            email,
            name: gUser.user_metadata?.full_name || gUser.user_metadata?.name || email.split('@')[0] || 'User',
            picture: gUser.user_metadata?.avatar_url || gUser.user_metadata?.picture || '',
            plan: isAdmin ? 'pro' : 'free',
            role: isAdmin ? 'admin' : 'user',
          };
          setUser(loggedUser);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(loggedUser));
          saveUserSession(loggedUser); // 90-day persistent cookie
          loadScopedData(loggedUser);
          triggerPostLoginPopup(loggedUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem(STORAGE_KEYS.USER);
          clearUserSession();
        }
      });


      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, [loadScopedData]);

  // Real Google Sign In via Supabase OAuth
  const signInWithGoogle = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
    } else {
      if (typeof window !== 'undefined') {
        const googleObj = (window as unknown as { google?: { accounts: { id: { prompt: () => void } } } }).google;
        if (googleObj?.accounts?.id) {
          googleObj.accounts.id.prompt();
        }
      }
    }
  }, []);

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

  // Popup trigger: PRO hanya muncul 1x setelah login, FREE berkala
  const triggerPostLoginPopup = useCallback((loggedUser: UserProfile) => {
    if (typeof window === 'undefined') return;
    if (loggedUser.plan === 'pro') {
      const seen = localStorage.getItem(STORAGE_KEYS.PRO_POPUP_SEEN(loggedUser.id));
      if (!seen) {
        localStorage.setItem(STORAGE_KEYS.PRO_POPUP_SEEN(loggedUser.id), 'true');
        setShowPlanModal(true);
      }
    } else {
      setShowPlanModal(true);
    }
  }, []);

  // Popup berkala tiap 5 menit khusus akun FREE
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!user) return;
    if (userPlan === 'pro' || isSuperAdmin) return;

    const interval = setInterval(() => {
      setShowPlanModal(true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, userPlan, isSuperAdmin]);

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
      saveUserSession(loggedUser);
    }
    loadScopedData(loggedUser);
    
    // Sync session to Supabase in background with ID token if configured
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialToken,
      }).catch(() => {});
    }

    // Popup post-login (1x untuk PRO, normal untuk FREE)
    triggerPostLoginPopup(loggedUser);
    return true;
  }, [loadScopedData, triggerPostLoginPopup]);


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
      saveUserSession(demoUser);
    }
    loadScopedData(demoUser);
    triggerPostLoginPopup(demoUser);
  }, [loadScopedData, triggerPostLoginPopup]);

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
      saveUserSession(adminUser);
    }
    loadScopedData(adminUser);
    triggerPostLoginPopup(adminUser);
  }, [loadScopedData, triggerPostLoginPopup]);

  const logout = useCallback(async () => {
    setUser(null);
    setTransactions([]);
    setAccounts([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER);
      clearUserSession();
    }
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
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

  const exportToExcel = useCallback(() => {
    if (userPlan !== 'pro' && !isSuperAdmin) {
      setShowPlanModal(true);
      alert('Ekspor Laporan Excel (.xlsx) adalah fitur eksklusif PRO. Silakan upgrade ke PRO (5000/th) via Instagram @naufal_irfansyah!');
      return;
    }

    try {
      const data = transactions.map((t, index) => ({
        'No': index + 1,
        'Tanggal': t.date,
        'Jam': t.time || '-',
        'Tipe': t.type === 'income' ? 'Pemasukan' : t.type === 'expense' ? 'Pengeluaran' : 'Transfer',
        'Kategori': t.category,
        'Nominal (Rp)': t.amount,
        'Sumber Rekening / Dompet': t.account_name,
        'Tujuan Transfer': t.to_account_name || '-',
        'Catatan': t.note || '-',
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Keuangan');

      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 10 },
        { wch: 15 },
        { wch: 24 },
        { wch: 18 },
        { wch: 24 },
        { wch: 24 },
        { wch: 38 },
      ];

      XLSX.writeFile(workbook, `Laporan_Keuangan_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Gagal export excel:', err);
      alert('Terjadi kesalahan saat memproses file Excel.');
    }
  }, [userPlan, isSuperAdmin, transactions]);

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

  // Superadmin Member Management
  const updateMemberPlan = useCallback(async (email: string, newPlan: UserPlan, name?: string) => {
    const emailKey = email.trim().toLowerCase();
    if (!emailKey) return;

    let registry: Record<string, MemberItem> = {};
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.MEMBERS) : null;
      if (raw) registry = JSON.parse(raw);
    } catch {}

    const existing = registry[emailKey];
    const updatedMember: MemberItem = {
      id: existing?.id || `user_${emailKey.replace(/[^a-z0-9]/g, '_')}`,
      email: emailKey,
      name: name || existing?.name || emailKey.split('@')[0],
      picture: existing?.picture || '',
      plan: newPlan,
      created_at: existing?.created_at || new Date().toISOString(),
    };

    registry[emailKey] = updatedMember;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(registry));
      localStorage.setItem(STORAGE_KEYS.PLAN(updatedMember.id), newPlan);
    }

    if (user && user.email.toLowerCase() === emailKey) {
      const updatedUser: UserProfile = { ...user, plan: newPlan };
      setUser(updatedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        saveUserSession(updatedUser);
      }
    }

    setMembers(Object.values(registry));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').upsert({
          email: emailKey,
          plan: newPlan,
          full_name: updatedMember.name,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' });
      } catch (err) {
        console.warn('Could not sync member plan to Supabase:', err);
      }
    }
  }, [user]);

  const deleteMember = useCallback(async (email: string) => {
    const emailKey = email.trim().toLowerCase();
    if (!emailKey) return;

    let registry: Record<string, MemberItem> = {};
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.MEMBERS) : null;
      if (raw) registry = JSON.parse(raw);
    } catch {}

    if (registry[emailKey]) {
      const memberId = registry[emailKey].id;
      delete registry[emailKey];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(registry));
        localStorage.removeItem(STORAGE_KEYS.PLAN(memberId));
      }
      setMembers(Object.values(registry));
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').delete().eq('email', emailKey);
      } catch (err) {
        console.warn('Could not delete member from Supabase:', err);
      }
    }
  }, []);

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
        signInWithGoogle,
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
        exportToExcel,
        exportToJson,
        importFromJson,
        resetToDefault,
        members,
        updateMemberPlan,
        deleteMember,
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
