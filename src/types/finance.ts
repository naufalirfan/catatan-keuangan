export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  category_icon?: string;
  category_color?: string;
  account_id: string;
  account_name: string;
  to_account_id?: string;
  to_account_name?: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note: string;
  receipt_url?: string;
  created_at: string;
}

export type AccountType = 'bank' | 'ewallet' | 'cash' | 'investment' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  icon: string;
  account_number?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  category: string;
  limit_amount: number;
  spent_amount?: number;
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string; // YYYY-MM-DD
  color: string;
  icon: string;
  note?: string;
  created_at: string;
}

export interface AiConfig {
  provider: 'gemini' | 'custom' | 'auto';
  geminiApiKey: string;
  geminiApiKeys?: string[];
  geminiModel: string;
  customEndpoint: string;
  customAuthToken: string;
  customModel: string;
  customFallbackModel?: string;
  isTest?: boolean;
}

export interface ParsedAiTransaction {
  type: TransactionType;
  amount: number;
  category: string;
  account: string;
  to_account?: string;
  date: string;
  note: string;
  confidence?: number;
  raw_text?: string;
}

export type UserPlan = 'free' | 'pro';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  plan: UserPlan;
  role: 'user' | 'admin';
}

export interface MemberItem {
  id: string;
  email: string;
  name: string;
  picture?: string;
  plan: UserPlan;
  created_at?: string;
}

