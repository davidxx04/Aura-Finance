import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { BudgetStore } from '../../../store/budget.store';
import { AuthStore } from '../../../store/auth.store';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatRippleModule],
  templateUrl: './layout.html',
})
export class Layout implements OnInit {
  private budgetStore = inject(BudgetStore);
  authStore = inject(AuthStore);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/app/dashboard' },
    { label: 'Budget', icon: 'account_balance_wallet', route: '/app/budget' },
    { label: 'History', icon: 'calendar_month', route: '/app/history' },
    { label: 'Settings', icon: 'settings', route: '/app/settings' },
  ];

  async ngOnInit(): Promise<void> {
    this.budgetStore.loadAll();
    this.budgetStore.ensureCurrentMonth();
    await this.authStore.init();
  }
}