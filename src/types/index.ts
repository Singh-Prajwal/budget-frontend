export interface User {
  user_id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Transaction {
  id: number;
  category: number;
  category_name: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  description: string;
}

export interface Budget {
  id: number;
  category: number;
  category_name: string;
  amount: string;
  month: number;
  year: number;
}

export interface ExpenseByCategory {
  category__name: string;
  total: string;
}

export interface BudgetVsActual {
  category_name: string;
  budgeted_amount: string;
  actual_amount: string;
  difference: string;
}

export interface FinancialSummary {
  total_income: string;
  total_expenses: string;
  balance: string;
  expenses_by_category: ExpenseByCategory[];
  budget_vs_actual: BudgetVsActual[];
}
export interface Category { id: number; name: string; }
export interface Transaction { id: number; category: number; category_name: string; amount: string; type: 'INCOME' | 'EXPENSE'; date: string; description: string; }
export interface Budget { id: number; category: number; category_name: string; amount: string; month: number; year: number; }
export interface ExpenseByCategory { category__name: string; total: string; }
export interface BudgetVsActual { category_name: string; budgeted_amount: string; actual_amount: string; difference: string; }
export interface FinancialSummary { total_income: string; total_expenses: string; balance: string; expenses_by_category: ExpenseByCategory[]; budget_vs_actual: BudgetVsActual[]; }