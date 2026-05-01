import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MonthlyBudget } from '../models';

const STORAGE_KEY = 'finance_tracker_budgets';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // --- Monthly Budgets ---

  getBudgets(): MonthlyBudget[] {
    if (!this.isBrowser) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getBudgetByMonth(month: string): MonthlyBudget | null {
    const budgets = this.getBudgets();
    return budgets.find(b => b.month === month) ?? null;
  }

  saveBudget(budget: MonthlyBudget): void {
    if (!this.isBrowser) return;
    const budgets = this.getBudgets();
    const index = budgets.findIndex(b => b.month === budget.month);
    if (index >= 0) {
      budgets[index] = budget;
    } else {
      budgets.push(budget);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  }

  deleteBudget(month: string): void {
    if (!this.isBrowser) return;
    const budgets = this.getBudgets().filter(b => b.month !== month);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  }

  clearAll(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(STORAGE_KEY);
  }

  exportData(): MonthlyBudget[] {
    return this.getBudgets();
  }

  importData(budgets: MonthlyBudget[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  }
}