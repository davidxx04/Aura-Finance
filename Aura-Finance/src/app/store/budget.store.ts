import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { StorageService } from '../core/services/storage.service';
import { MonthlyBudget, BudgetSection, BudgetTable, BudgetTableRow, SectionType } from '../core/models';

interface BudgetState {
  budgets: MonthlyBudget[];
  selectedMonth: string;
  loading: boolean;
}

function currentMonthString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const BudgetStore = signalStore(
  { providedIn: 'root' },

  withState<BudgetState>({
    budgets: [],
    selectedMonth: currentMonthString(),
    loading: false,
  }),

  withComputed(({ budgets, selectedMonth }) => ({

    currentBudget: computed(() =>
      budgets().find(b => b.month === selectedMonth()) ?? null
    ),

    currentIncome: computed(() => {
      const budget = budgets().find(b => b.month === selectedMonth());
      return calcSectionTotal(budget, 'income');
    }),

    currentExpenses: computed(() => {
      const budget = budgets().find(b => b.month === selectedMonth());
      return calcSectionTotal(budget, 'expenses');
    }),

    currentSavings: computed(() => {
      const budget = budgets().find(b => b.month === selectedMonth());
      return calcSectionTotal(budget, 'savings');
    }),

    currentBalance: computed(() => {
      const budget = budgets().find(b => b.month === selectedMonth());
      const income = calcSectionTotal(budget, 'income');
      const expenses = calcSectionTotal(budget, 'expenses');
      return income - expenses;
    }),

    sortedBudgets: computed(() =>
      [...budgets()].sort((a, b) => a.month.localeCompare(b.month))
    ),

    chartData: computed(() => {
      const sorted = [...budgets()].sort((a, b) => a.month.localeCompare(b.month));
      return {
        months: sorted.map(b => b.month),
        income: sorted.map(b => calcSectionTotal(b, 'income')),
        realSavings: sorted.map(b => calcSectionTotal(b, 'savings')),
      };
    }),

  })),

  withMethods((store, storage = inject(StorageService)) => ({

    loadAll(): void {
      const budgets = storage.getBudgets();
      patchState(store, { budgets });
    },

    selectMonth(month: string): void {
      patchState(store, { selectedMonth: month });
    },

    upsertBudget(budget: MonthlyBudget): void {
      storage.saveBudget(budget);
      const budgets = storage.getBudgets();
      patchState(store, { budgets });
    },

    ensureCurrentMonth(): void {
      const month = store.selectedMonth();
      const exists = store.budgets().some(b => b.month === month);
      if (!exists) {
        const newBudget: MonthlyBudget = {
          id: crypto.randomUUID(),
          userId: null,
          month,
          sections: [
            emptySection('income'),
            emptySection('savings'),
            emptySection('expenses'),
          ],
        };
        storage.saveBudget(newBudget);
        patchState(store, { budgets: storage.getBudgets() });
      }
    },

    addTable(sectionType: SectionType, tableName: string): void {
      const budget = store.currentBudget();
      if (!budget) return;
      const updated = addTableToBudget(budget, sectionType, tableName);
      storage.saveBudget(updated);
      patchState(store, { budgets: storage.getBudgets() });
    },

    copyPreviousTables(sectionType: SectionType): void {
      const current = store.currentBudget();
      if (!current) return;
      
      const all = store.budgets().filter(b => b.month < current.month).sort((a, b) => b.month.localeCompare(a.month));
      if (all.length === 0) return;
      
      let prevSection;
      for (const b of all) {
        const s = b.sections.find(sec => sec.type === sectionType);
        if (s && s.tables.length > 0) {
          prevSection = s;
          break;
        }
      }

      if (!prevSection) return;

      let updated = { ...current };
      updated.sections = updated.sections.map(s => {
        if (s.type === sectionType) {
          const copiedTables = prevSection.tables.map(t => ({
            ...t,
            id: crypto.randomUUID(),
            rows: t.rows.map(r => ({ ...r, id: crypto.randomUUID() }))
          }));
          return { ...s, tables: [...s.tables, ...copiedTables] };
        }
        return s;
      });

      storage.saveBudget(updated);
      patchState(store, { budgets: storage.getBudgets() });
    },

    addRow(sectionType: SectionType, tableId: string): void {
      const budget = store.currentBudget();
      if (!budget) return;
      const updated = addRowToTable(budget, sectionType, tableId);
      storage.saveBudget(updated);
      patchState(store, { budgets: storage.getBudgets() });
    },

    updateRow(sectionType: SectionType, tableId: string, row: BudgetTableRow): void {
      const budget = store.currentBudget();
      if (!budget) return;
      const updated = updateRowInTable(budget, sectionType, tableId, row);
      storage.saveBudget(updated);
      patchState(store, { budgets: storage.getBudgets() });
    },

    deleteRow(sectionType: SectionType, tableId: string, rowId: string): void {
      const budget = store.currentBudget();
      if (!budget) return;
      const updated = deleteRowFromTable(budget, sectionType, tableId, rowId);
      storage.saveBudget(updated);
      patchState(store, { budgets: storage.getBudgets() });
    },

    deleteTable(sectionType: SectionType, tableId: string): void {
      const budget = store.currentBudget();
      if (!budget) return;
      const updated = deleteTableFromBudget(budget, sectionType, tableId);
      storage.saveBudget(updated);
      patchState(store, { budgets: storage.getBudgets() });
    },

  }))
);

// --- helpers puros ---

function calcSectionTotal(budget: MonthlyBudget | undefined, type: SectionType): number {
  if (!budget) return 0;
  const section = budget.sections.find(s => s.type === type);
  if (!section) return 0;
  return section.tables.reduce((tAcc, table) =>
    tAcc + table.rows.reduce((rAcc, row) => rAcc + (row.amount || 0), 0), 0
  );
}

function emptySection(type: SectionType): BudgetSection {
  return {
    id: crypto.randomUUID(),
    monthlyBudgetId: '',
    type,
    tables: [],
  };
}

function addTableToBudget(budget: MonthlyBudget, type: SectionType, name: string): MonthlyBudget {
  const newTable: BudgetTable = {
    id: crypto.randomUUID(),
    sectionId: '',
    name,
    rows: [],
  };
  return {
    ...budget,
    sections: budget.sections.map(s =>
      s.type === type ? { ...s, tables: [...s.tables, newTable] } : s
    ),
  };
}

function addRowToTable(budget: MonthlyBudget, type: SectionType, tableId: string): MonthlyBudget {
  const newRow: BudgetTableRow = {
    id: crypto.randomUUID(),
    tableId,
    label: '',
    amount: 0,
  };
  return {
    ...budget,
    sections: budget.sections.map(s =>
      s.type !== type ? s : {
        ...s,
        tables: s.tables.map(t =>
          t.id !== tableId ? t : { ...t, rows: [...t.rows, newRow] }
        ),
      }
    ),
  };
}

function updateRowInTable(budget: MonthlyBudget, type: SectionType, tableId: string, row: BudgetTableRow): MonthlyBudget {
  return {
    ...budget,
    sections: budget.sections.map(s =>
      s.type !== type ? s : {
        ...s,
        tables: s.tables.map(t =>
          t.id !== tableId ? t : {
            ...t,
            rows: t.rows.map(r => r.id === row.id ? row : r),
          }
        ),
      }
    ),
  };
}

function deleteRowFromTable(budget: MonthlyBudget, type: SectionType, tableId: string, rowId: string): MonthlyBudget {
  return {
    ...budget,
    sections: budget.sections.map(s =>
      s.type !== type ? s : {
        ...s,
        tables: s.tables.map(t =>
          t.id !== tableId ? t : {
            ...t,
            rows: t.rows.filter(r => r.id !== rowId),
          }
        ),
      }
    ),
  };
}

function deleteTableFromBudget(budget: MonthlyBudget, type: SectionType, tableId: string): MonthlyBudget {
  return {
    ...budget,
    sections: budget.sections.map(s =>
      s.type !== type ? s : {
        ...s,
        tables: s.tables.filter(t => t.id !== tableId),
      }
    ),
  };
}