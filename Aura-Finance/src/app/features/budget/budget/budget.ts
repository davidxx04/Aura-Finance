import { Component, inject, signal, computed } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { BudgetStore } from '../../../store/budget.store';
import { BudgetCardsComponent } from '../../../shared/components/budget-cards/budget-cards.component';

interface MonthCell {
  month: string;
  label: string;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  hasData: boolean;
}

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [MatIconModule, CurrencyPipe, BudgetCardsComponent],
  templateUrl: './budget.html',
  styleUrl: './budget.css'
})
export class Budget {
  budgetStore = inject(BudgetStore);

  today = new Date();
  selectedYear = signal(this.today.getFullYear());
  selectedMonth = signal<string | null>(null);

  monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  months = computed((): MonthCell[] => {
    const year = this.selectedYear();
    const currentMonth = this.today.getMonth();
    const currentYear = this.today.getFullYear();

    return this.monthNames.map((label, i) => {
      const month = `${year}-${String(i + 1).padStart(2, '0')}`;
      const isPast = year < currentYear || (year === currentYear && i < currentMonth);
      const isCurrent = year === currentYear && i === currentMonth;
      const isFuture = year > currentYear || (year === currentYear && i > currentMonth);
      
      const budget = this.budgetStore.budgets().find(b => b.month === month);
      const hasData = budget ? budget.sections.every(s => 
        s.tables.some(t => t.rows.some(r => r.amount && r.amount !== 0 || r.label))
      ) : false;

      return { month, label, isPast, isCurrent, isFuture, hasData };
    });
  });

  selectMonth(cell: MonthCell): void {
    if (cell.isFuture) return;
    this.budgetStore.selectMonth(cell.month);
    this.budgetStore.ensureCurrentMonth();
    this.selectedMonth.set(cell.month);
  }

  goBack(): void {
    this.selectedMonth.set(null);
  }

  prevYear(): void {
    this.selectedYear.update(y => y - 1);
  }

  nextYear(): void {
    if (this.selectedYear() < this.today.getFullYear()) {
      this.selectedYear.update(y => y + 1);
    }
  }

  getMonthTotal(month: string): number {
    const budget = this.budgetStore.budgets().find(b => b.month === month);
    if (!budget) return 0;
    return budget.sections
      .filter(s => s.type === 'income')
      .reduce((acc, s) => acc + s.tables.reduce((tAcc, t) =>
        tAcc + t.rows.reduce((rAcc, r) => rAcc + (r.amount || 0), 0), 0), 0);
  }
}