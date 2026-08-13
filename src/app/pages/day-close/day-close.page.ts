import { Component, OnInit } from '@angular/core';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';
import { ToastController } from '@ionic/angular';
import { hudaRupees } from '../../shared/ui';

/** Segment classes are styled in huda-pharmacy.scss; `other` catches anything new. */
const KNOWN_METHODS = ['cash', 'upi', 'card'] as const;

interface MethodRow {
  method: string;
  label: string;
  swatch: string;
  paise: number;
  sharePct: number;
}

@Component({
  selector: 'app-day-close',
  templateUrl: './day-close.page.html',
  styleUrls: ['./day-close.page.scss'],
  standalone: false,
})
export class DayClosePage implements OnInit {
  date = new Date().toISOString().slice(0, 10);
  summary: any = null;
  loading = true;
  busy = false;
  error = '';

  constructor(
    private api: PharmacyApiService,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      this.summary = await this.api.getDayClose(this.date);
    } catch {
      this.summary = null;
    } finally {
      this.loading = false;
    }
  }

  async closeDay() {
    this.error = '';
    this.busy = true;
    try {
      this.summary = await this.api.dayClose(this.date);
      const t = await this.toast.create({
        message: 'Day closed',
        duration: 2000,
        color: 'success',
      });
      await t.present();
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Day close failed';
    } finally {
      this.busy = false;
    }
  }

  inr(paise: number) {
    return hudaRupees(paise);
  }

  get totalPaise(): number {
    return this.summary?.totalPaise ?? this.summary?.total ?? 0;
  }

  get paymentCount(): number {
    return this.summary?.paymentCount ?? 0;
  }

  get isLocked(): boolean {
    return Boolean(this.summary?.locked);
  }

  get lockedAt(): string {
    const iso = this.summary?.lockedAt;
    if (!iso) return '';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('en-IN');
  }

  get isToday(): boolean {
    return this.date === new Date().toISOString().slice(0, 10);
  }

  get methodRows(): MethodRow[] {
    const totals = (this.summary?.totalsByMethod || {}) as Record<string, number>;
    const total = this.totalPaise || 1;
    return Object.entries(totals)
      .filter(([, paise]) => (paise || 0) > 0)
      .map(([method, paise]) => ({
        method,
        label: this.methodLabel(method),
        swatch: (KNOWN_METHODS as readonly string[]).includes(method) ? method : 'other',
        paise: paise || 0,
        sharePct: Math.round(((paise || 0) / total) * 100),
      }))
      .sort((a, b) => b.paise - a.paise);
  }

  private methodLabel(method: string): string {
    if (method === 'upi') return 'UPI';
    return method.charAt(0).toUpperCase() + method.slice(1);
  }
}
