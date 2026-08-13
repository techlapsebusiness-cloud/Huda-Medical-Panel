import { Component, OnInit } from '@angular/core';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';
import { hudaRupees } from '../../shared/ui';

interface DayBar {
  date: string;
  label: string;
  paise: number;
  heightPct: number;
  peak: boolean;
}

interface TopDrugMeter {
  drugId: string;
  brandName: string;
  genericName: string;
  unitsSold: number;
  widthPct: number;
}

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
  standalone: false,
})
export class AnalyticsPage implements OnInit {
  data: any = null;
  loading = true;
  error = '';

  constructor(private api: PharmacyApiService) {}

  async ngOnInit() {
    try {
      this.data = await this.api.analytics();
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Failed to load analytics';
    } finally {
      this.loading = false;
    }
  }

  inr(paise: number) {
    return `₹${hudaRupees(paise)}`;
  }

  /** Day series scaled to the tallest bar — the chart is CSS, not a library. */
  get dayBars(): DayBar[] {
    const days = (this.data?.sales?.byDay || []) as { date: string; paise: number }[];
    if (!days.length) return [];
    const max = Math.max(...days.map((d) => d.paise || 0), 1);
    return days.map((d) => ({
      date: d.date,
      label: this.shortDate(d.date),
      paise: d.paise || 0,
      heightPct: Math.round(((d.paise || 0) / max) * 100),
      peak: (d.paise || 0) === max,
    }));
  }

  get topDrugs(): TopDrugMeter[] {
    const drugs = (this.data?.topDrugs || []) as any[];
    if (!drugs.length) return [];
    const max = Math.max(...drugs.map((d) => d.unitsSold || 0), 1);
    return drugs.slice(0, 6).map((d) => ({
      drugId: d.drugId,
      brandName: d.brandName || 'Medicine',
      genericName: d.genericName || '',
      unitsSold: d.unitsSold || 0,
      widthPct: Math.round(((d.unitsSold || 0) / max) * 100),
    }));
  }

  get collectionPct(): number {
    const gross = this.data?.sales?.grossPaise || 0;
    if (!gross) return 0;
    return Math.min(100, Math.round(((this.data?.sales?.collectedPaise || 0) / gross) * 100));
  }

  get outstandingPaise(): number {
    return Math.max(
      0,
      (this.data?.sales?.grossPaise || 0) - (this.data?.sales?.collectedPaise || 0)
    );
  }

  get marginPct(): number {
    const gross = this.data?.sales?.grossPaise || 0;
    if (!gross) return 0;
    return Math.round(((this.data?.profitPaise || 0) / gross) * 100);
  }

  private shortDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }
}
