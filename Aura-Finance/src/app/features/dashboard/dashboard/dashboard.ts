import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { BudgetStore } from '../../../store/budget.store';
import { SavingsChartComponent } from '../../../shared/components/savings-chart/savings-chart.component';
import { BudgetCardsComponent } from '../../../shared/components/budget-cards/budget-cards.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink, MatIconModule, SavingsChartComponent, BudgetCardsComponent],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  budgetStore = inject(BudgetStore);

  today = new Date();
  currentMonthStr = `${this.today.getFullYear()}-${String(this.today.getMonth() + 1).padStart(2, '0')}`;

  ngOnInit() {
    this.budgetStore.selectMonth(this.currentMonthStr);
    this.budgetStore.ensureCurrentMonth();
  }

  balance = this.budgetStore.currentBalance;
}