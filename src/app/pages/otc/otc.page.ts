import { Component } from '@angular/core';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';
import { ToastController } from '@ionic/angular';
import { hudaRupees, hudaStatusBadge, type HudaBadgeVariant } from '../../shared/ui';

interface CartLine {
  drugId: string;
  name: string;
  qty: number;
  unitPricePaise: number;
  maxQty: number;
}

@Component({
  selector: 'app-otc',
  templateUrl: './otc.page.html',
  styleUrls: ['./otc.page.scss'],
  standalone: false,
})
export class OtcPage {
  q = '';
  results: any[] = [];
  cart: CartLine[] = [];
  customerPhone = '';
  customerName = '';
  busy = false;
  bill: any = null;
  error = '';

  constructor(private api: PharmacyApiService, private toast: ToastController) {}

  async search() {
    if (!this.q.trim()) {
      this.results = [];
      return;
    }
    try {
      this.results = await this.api.searchDrugs(this.q.trim());
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Search failed';
    }
  }

  async add(d: any) {
    const id = d.id || d._id;
    const maxQty = Math.max(0, Math.floor(Number(d.qtyAvailable ?? 0)));
    if (maxQty < 1) {
      const t = await this.toast.create({
        message: 'That medicine is out of stock.',
        duration: 2000,
        color: 'warning',
      });
      await t.present();
      return;
    }
    const price = Math.round(Number(d.avgMrpPaise ?? d.mrpPaise ?? 0));
    const existing = this.cart.find((c) => c.drugId === id);
    if (existing) {
      existing.maxQty = maxQty;
      existing.unitPricePaise = price;
      existing.qty = Math.min(maxQty, existing.qty + 1);
      return;
    }
    this.cart.push({
      drugId: id,
      name: d.brand_name || d.brandName || 'Drug',
      qty: 1,
      unitPricePaise: price > 0 ? price : 0,
      maxQty,
    });
  }

  stockLabel(d: any): string {
    const qty = Number(d?.qtyAvailable ?? 0);
    const status = d?.stockStatus as string | undefined;
    if (status === 'out_of_stock' || qty <= 0) return 'Out of stock · 0';
    if (status === 'low_stock') return `Low · ${qty}`;
    return `In stock · ${qty}`;
  }

  stockClass(d: any): 'success' | 'warning' | 'danger' {
    const qty = Number(d?.qtyAvailable ?? 0);
    const status = d?.stockStatus as string | undefined;
    if (status === 'out_of_stock' || qty <= 0) return 'danger';
    if (status === 'low_stock') return 'warning';
    return 'success';
  }

  async checkout() {
    this.busy = true;
    this.error = '';
    try {
      this.bill = await this.api.createSale({
        items: this.cart.map((c) => ({
          drugId: c.drugId,
          qty: Math.min(c.maxQty, Math.max(1, Math.floor(c.qty) || 1)),
          unitPricePaise: c.unitPricePaise,
        })),
        customerPhone: this.customerPhone,
        customerName: this.customerName,
      });
      this.cart = [];
      const t = await this.toast.create({
        message: `Sale bill #${this.bill.billNumber} issued`,
        duration: 2500,
        color: 'success',
      });
      await t.present();
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Sale failed';
    } finally {
      this.busy = false;
    }
  }

  async payAndWhatsapp() {
    if (!this.bill?.id) return;
    this.busy = true;
    try {
      await this.api.recordPayment(this.bill.id, {
        amountPaise: this.bill.grandTotalPaise,
        method: 'cash',
      });
      const share = await this.api.whatsappShare(this.bill.id, {
        phone: this.customerPhone,
      });
      if (share.waUrl) window.open(share.waUrl, '_blank');
      if (share.pdfUrl) window.open(share.pdfUrl, '_blank');
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Failed';
    } finally {
      this.busy = false;
    }
  }

  step(line: CartLine, delta: number): void {
    this.setQty(line, (line.qty || 1) + delta);
  }

  setQty(line: CartLine, raw: number | string): void {
    const n = Math.floor(Number(raw) || 0);
    const max = Math.max(1, line.maxQty || 1);
    line.qty = Math.min(max, Math.max(1, n));
  }

  lineTotal(line: CartLine): number {
    return (line.unitPricePaise || 0) * (line.qty || 0);
  }

  get cartTotalPaise(): number {
    return this.cart.reduce((sum, line) => sum + this.lineTotal(line), 0);
  }

  remove(line: CartLine): void {
    this.cart = this.cart.filter((c) => c.drugId !== line.drugId);
  }

  get totalUnits(): number {
    return this.cart.reduce((sum, c) => sum + (c.qty || 0), 0);
  }

  rupees(paise: number): string {
    return hudaRupees(paise);
  }

  badge(status: string): HudaBadgeVariant {
    return hudaStatusBadge(status);
  }
}
