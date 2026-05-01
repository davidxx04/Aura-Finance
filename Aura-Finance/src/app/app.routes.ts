import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing/landing').then(m => m.Landing),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register/register').then(m => m.Register),
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./features/layout/layout/layout').then(m => m.Layout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'budget',
        loadComponent: () =>
          import('./features/budget/budget/budget').then(m => m.Budget),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history/history').then(m => m.History),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings/settings').then(m => m.Settings),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];