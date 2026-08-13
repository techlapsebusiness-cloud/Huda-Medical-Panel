import { Component } from '@angular/core';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';
import { ToastController } from '@ionic/angular';
import type { HudaBadgeVariant } from '../../shared/ui';

type ReturnMode = 'return_restock' | 'return_writeoff';

interface ReturnResult {
  label: string;
  variant: HudaBadgeVariant;
  qty: number;
  billId: string;
}

@Component({
  selector: 'app-returns',
  templateUrl: './returns.page.html',
  styleUrls: ['./returns.page.scss'],
  standalone: false,
})
export class ReturnsPage {
  billId = '';
  lotId = '';
  qty = 1;
  mode: ReturnMode = 'return_restock';
  note = '';
  error = '';
  busy = false;
  lastResult: ReturnResult | null = null;

  constructor(
    private api: PharmacyApiService,
    private toast: ToastController
  ) {}

  async submit() {
    this.error = '';
    this.busy = true;
    try {
      await this.api.createReturn({
        billId: this.billId.trim(),
        lines: [
          {
            lotId: this.lotId.trim(),
            qty: Number(this.qty),
            mode: this.mode,
            note: this.note,
          },
        ],
      });
      this.lastResult = {
        label: this.mode === 'return_restock' ? 'Restocked' : 'Written off',
        variant: this.mode === 'return_restock' ? 'success' : 'danger',
        qty: Number(this.qty),
        billId: this.billId.trim(),
      };
      const t = await this.toast.create({
        message: 'Return processed',
        duration: 2000,
        color: 'success',
      });
      await t.present();
      this.reset();
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Return failed';
    } finally {
      this.busy = false;
    }
  }

  step(delta: number): void {
    this.qty = Math.max(1, (Number(this.qty) || 1) + delta);
  }

  get modeHint(): string {
    return this.mode === 'return_restock'
      ? 'Quantity goes back into the lot and can be dispensed again.'
      : 'Quantity leaves inventory and is recorded as a loss.';
  }

  private reset(): void {
    this.lotId = '';
    this.qty = 1;
    this.note = '';
  }
}
