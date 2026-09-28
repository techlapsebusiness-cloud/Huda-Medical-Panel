import { Component } from '@angular/core';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';
import { hudaRupees, type HudaBadgeVariant } from '../../shared/ui';

/** Lots inside this window are flagged so the counter rotates them first. */
const EXPIRY_WARNING_DAYS = 90;

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
  standalone: false,
})
export class ScannerPage {
  code = '';
  result: any = null;
  error = '';
  busy = false;
  searched = false;
  recent: string[] = [];

  constructor(private api: PharmacyApiService) {}

  async lookup() {
    const code = this.code.trim();
    if (!code) return;
    this.error = '';
    this.result = null;
    this.busy = true;
    try {
      this.result = await this.api.barcode(code);
      this.recent = [code, ...this.recent.filter((c) => c !== code)].slice(0, 5);
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Not in stock';
    } finally {
      this.busy = false;
      this.searched = true;
    }
  }

  useRecent(code: string) {
    this.code = code;
    void this.lookup();
  }

  clear() {
    this.code = '';
    this.result = null;
    this.error = '';
    this.searched = false;
  }

  inr(paise: number): string {
    return hudaRupees(paise);
  }

  get isLot(): boolean {
    return this.result?.kind === 'lot';
  }

  get drugName(): string {
    const drug = this.result?.drug;
    if (!drug) return 'Unknown medicine';
    return `${drug.brand_name || 'Medicine'} ${drug.strength || ''}`.trim();
  }

  get genericName(): string {
    return this.result?.drug?.generic_name || '';
  }

  get stockVariant(): HudaBadgeVariant {
    const qty = this.result?.qtyOnHand ?? 0;
    if (qty <= 0) return 'danger';
    if (qty < 10) return 'warning';
    return 'success';
  }

  get stockLabel(): string {
    const qty = this.result?.qtyOnHand ?? 0;
    if (qty <= 0) return 'Out of stock';
    return `${qty} in stock`;
  }

  get expiryVariant(): HudaBadgeVariant {
    const expiry = new Date(this.result?.expiryDate).getTime();
    if (Number.isNaN(expiry)) return 'neutral';
    if (expiry < Date.now()) return 'danger';
    if (expiry - Date.now() < EXPIRY_WARNING_DAYS * 86400000) return 'warning';
    return 'success';
  }

  get expiryLabel(): string {
    const raw = this.result?.expiryDate;
    if (!raw) return 'No expiry recorded';
    const expiry = new Date(raw).getTime();
    if (Number.isNaN(expiry)) return raw;
    if (expiry < Date.now()) return `Expired ${raw}`;
    return `Expires ${raw}`;
  }
}
