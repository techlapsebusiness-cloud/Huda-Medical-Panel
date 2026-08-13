import { Component, computed } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { CounterStateService } from './core/services/counter-state.service';
import { hudaInitials } from './shared/ui';

interface MenuEntry {
  title: string;
  url: string;
  icon: string;
  badge?: boolean;
  group: 'counter' | 'inventory' | 'business' | 'account';
}

const ALL_PAGES: MenuEntry[] = [
  { title: 'Dispense queue', url: '/queue', icon: 'medkit-outline', badge: true, group: 'counter' },
  { title: 'OTC sale', url: '/otc', icon: 'cart-outline', group: 'counter' },
  { title: 'Barcode lookup', url: '/scanner', icon: 'barcode-outline', group: 'counter' },
  { title: 'Stock / receive', url: '/stock', icon: 'cube-outline', group: 'inventory' },
  { title: 'Returns', url: '/returns', icon: 'return-down-back-outline', group: 'inventory' },
  { title: 'Analytics', url: '/analytics', icon: 'stats-chart-outline', group: 'business' },
  { title: 'Day close', url: '/day-close', icon: 'calendar-outline', group: 'business' },
  { title: 'Settings', url: '/settings', icon: 'settings-outline', group: 'account' },
];

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  readonly loggedIn = computed(() => this.auth.sessionState() !== null);
  readonly clinicName = computed(() => this.auth.sessionState()?.clinic?.name ?? 'Clinic');
  readonly memberName = computed(() => this.auth.sessionState()?.user?.name ?? '');
  readonly role = computed(() => this.auth.sessionState()?.membership?.role ?? 'Pharmacy counter');
  readonly initials = computed(() => hudaInitials(this.memberName()));
  readonly pending = this.counter.pendingCount;

  readonly counterPages = ALL_PAGES.filter((p) => p.group === 'counter');
  readonly inventoryPages = ALL_PAGES.filter((p) => p.group === 'inventory');
  readonly businessPages = ALL_PAGES.filter((p) => p.group === 'business');
  readonly accountPages = ALL_PAGES.filter((p) => p.group === 'account');

  constructor(
    public auth: AuthService,
    private counter: CounterStateService
  ) {}

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}
