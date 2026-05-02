import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BudgetStore } from '../../../store/budget.store';
import { SavingsChartComponent } from '../../../shared/components/savings-chart/savings-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, MatIconModule, SavingsChartComponent],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  budgetStore = inject(BudgetStore);

  today = new Date();

  cards = [
    {
      label: 'Income',
      value: this.budgetStore.currentIncome,
      icon: 'trending_up',
      bg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    {
      label: 'Expenses',
      value: this.budgetStore.currentExpenses,
      icon: 'trending_down',
      bg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      valueColor: 'text-red-400',
    },
    {
      label: 'Savings',
      value: this.budgetStore.currentSavings,
      icon: 'savings',
      bg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
      valueColor: 'text-violet-400',
    },
    {
      label: 'Expected savings',
      value: this.budgetStore.currentExpectedSavings,
      icon: 'flag',
      bg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
      valueColor: 'text-blue-400',
    },
  ];

  balance = this.budgetStore.currentBalance;
}