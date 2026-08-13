import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'queue', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'queue',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/queue/queue.module').then((m) => m.QueuePageModule),
  },
  {
    path: 'dispense/:id',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/dispense/dispense.module').then((m) => m.DispensePageModule),
  },
  {
    path: 'otc',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/otc/otc.module').then((m) => m.OtcPageModule),
  },
  {
    path: 'stock',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/stock/stock.module').then((m) => m.StockPageModule),
  },
  {
    path: 'analytics',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/analytics/analytics.module').then(
        (m) => m.AnalyticsPageModule
      ),
  },
  {
    path: 'returns',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/returns/returns.module').then((m) => m.ReturnsPageModule),
  },
  {
    path: 'day-close',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/day-close/day-close.module').then(
        (m) => m.DayClosePageModule
      ),
  },
  {
    path: 'scanner',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/scanner/scanner.module').then((m) => m.ScannerPageModule),
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/settings/settings.module').then(
        (m) => m.SettingsPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
