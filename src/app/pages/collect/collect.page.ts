import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';
import { CounterStateService } from '../../core/services/counter-state.service';
import { hudaRupees, hudaStatusBadge, type HudaBadgeVariant } from '../../shared/ui';

@Component({
  selector: 'app-collect',
  templateUrl: './collect.page.html',
  styleUrls: ['./collect.page.scss'],
  standalone: false,
})
export class CollectPage implements OnInit, OnDestroy {
  bills: any[] = [];
  q = '';
  loading = false;
  error = '';
  private poll?: ReturnType<typeof setInterval>;

  constructor(
    private api: PharmacyApiService,
    private counter: CounterStateService,
    private router: Router
  ) {}

  ngOnInit() {
    void this.refresh();
    this.poll = setInterval(() => void this.refresh(), 10_000);
  }

  ngOnDestroy() {
    if (this.poll) clearInterval(this.poll);
  }

  async refresh(event?: CustomEvent) {
    if (!this.bills.length || event) this.loading = true;
    this.error = '';
    try {
      this.bills = await this.api.listCollectBills('unpaid,partial', this.q || undefined);
      this.counter.setCollect(this.bills.length);
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Failed to load bills to collect';
    } finally {
      this.loading = false;
      (event?.target as HTMLIonRefresherElement)?.complete?.();
    }
  }

  open(bill: any) {
    void this.router.navigate(['/collect', bill.id]);
  }

  get unpaidCount(): number {
    return this.bills.filter((b) => (b.paymentStatus || 'unpaid') === 'unpaid').length;
  }

  get partialCount(): number {
    return this.bills.filter((b) => b.paymentStatus === 'partial').length;
  }

  get totalBalancePaise(): number {
    return this.bills.reduce(
      (sum, b) =>
        sum + Math.max(0, (b.grandTotalPaise || 0) - (b.amountPaidPaise || 0)),
      0
    );
  }

  remaining(bill: any): number {
    return Math.max(0, (bill.grandTotalPaise || 0) - (bill.amountPaidPaise || 0));
  }

  rupees(paise: number) {
    return hudaRupees(paise);
  }

  badge(status: string): HudaBadgeVariant {
    return hudaStatusBadge(status);
  }

  hasToken(bill: any): boolean {
    return bill?.appointmentToken !== null && bill?.appointmentToken !== undefined;
  }
}
