# Aura Finance — Contexto del proyecto

## Stack
- Angular 21, standalone, SSR (@angular/ssr)
- Tailwind CSS 3.4
- Angular Material 3
- NgRx Signals Store
- ECharts (ngx-echarts)
- Supabase (pendiente de integrar)

## Convenciones Angular 21
- El CLI genera clases SIN sufijo Component: `export class Dashboard` no `DashboardComponent`
- Archivos sin .component: `dashboard.ts` no `dashboard.component.ts`
- Rutas dobles: features/dashboard/dashboard/dashboard.ts
- Instalar dependencias con --legacy-peer-deps

## Estructura
src/app/
  core/
    models/         → budget.models.ts, user.models.ts
    services/       → storage.service.ts
    guards/
    interceptors/
  shared/
    components/     → savings-chart
  features/
    layout/layout/
    landing/landing/
    auth/login/login, auth/register/register
    dashboard/dashboard/
    budget/budget/
    history/history/
    settings/settings/
  store/            → budget.store.ts
  app.routes.ts
  app.config.ts

## Estado actual
- [x] Fase 0: Setup completo
- [x] Fase 1: Layout con sidebar
- [x] Fase 2: Modelos + StorageService + BudgetStore
- [x] Fase 3: Dashboard con tarjetas y gráfica ECharts
- [ ] Fase 4: Budget builder
- [ ] Fase 5: History
- [ ] Fase 6: Auth + Supabase
- [ ] Fase 7: GSAP
- [ ] Fase 8: PWA + Deploy

## Decisiones tomadas
- Modo guest con localStorage, sin necesidad de registro
- Sin zone.js (zoneless por defecto en Angular 21+)
- inline styles para layout crítico, Tailwind para utilidades
- patchState importado explícitamente desde @ngrx/signals