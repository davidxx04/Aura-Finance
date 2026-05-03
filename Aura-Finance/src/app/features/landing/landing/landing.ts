import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  features: Feature[] = [
    {
      icon: 'account_balance_wallet',
      title: 'Monthly budget builder',
      description: 'Organize your income, expenses and savings with custom tables. As detailed or as simple as you want.',
    },
    {
      icon: 'trending_up',
      title: 'Visual evolution',
      description: 'Track your financial progress over time with an interactive chart. See where you are heading.',
    },
    {
      icon: 'lock_open',
      title: 'No account needed',
      description: 'Start tracking immediately. Your data stays in your browser. Create an account only when you want to.',
    },
    {
      icon: 'devices',
      title: 'Works everywhere',
      description: 'Fully responsive and installable as a PWA. Access your finances from any device.',
    },
  ];
}