export type SectionType = 'income' | 'savings' | 'expenses';

export interface BudgetTableRow {
  id: string;
  tableId: string;
  label: string;
  amount: number;
}

export interface BudgetTable {
  id: string;
  sectionId: string;
  name: string;
  rows: BudgetTableRow[];
}

export interface BudgetSection {
  id: string;
  monthlyBudgetId: string;
  type: SectionType;
  tables: BudgetTable[];
}

export interface MonthlyBudget {
  id: string;
  userId: string | null;
  month: string; // formato YYYY-MM
  extraSavings: number;
  sections: BudgetSection[];
}