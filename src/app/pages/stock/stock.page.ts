import { Component, OnInit } from '@angular/core';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.page.html',
  styleUrls: ['./stock.page.scss'],
  standalone: false,
})
export class StockPage implements OnInit {
  summary: any = null;
  q = '';
  drugs: any[] = [];
  receive = { drugId: '', batchNo: '', qty: 10, mrpPaise: 0, costPaise: 0, expiryDate: '' };
  selectedName = '';
  mrpRupees = '';
  costRupees = '';
  message = '';
  error = '';

  constructor(private api: PharmacyApiService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    try {
      this.summary = await this.api.inventorySummary();
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Failed to load stock';
    }
  }

  async search() {
    if (!this.q.trim()) {
      this.drugs = [];
      return;
    }
    this.drugs = await this.api.searchDrugs(this.q.trim());
  }

  pick(d: any) {
    this.receive.drugId = d.id || d._id;
    this.selectedName = `${d.brand_name || d.brandName || 'Drug'} ${d.strength || ''}`.trim();
    this.drugs = [];
    this.q = '';
  }

  clearPick() {
    this.receive.drugId = '';
    this.selectedName = '';
  }

  async submitReceive() {
    this.error = '';
    this.message = '';
    try {
      await this.api.receiveLot({
        drugId: this.receive.drugId,
        batchNo: this.receive.batchNo,
        qty: Number(this.receive.qty),
        mrpPaise: this.toPaise(this.mrpRupees),
        costPaise: this.toPaise(this.costRupees),
        expiryDate: this.receive.expiryDate || null,
      });
      this.message = `Received ${this.receive.qty} × ${this.selectedName || 'stock'}`;
      this.resetForm();
      await this.load();
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Receive failed';
    }
  }

  get trackedCount(): number | string {
    return this.summary?.trackedDrugs ?? this.summary?.tracked ?? '—';
  }

  get lowStockCount(): number {
    return Number(this.summary?.lowStockCount ?? this.summary?.lowStock ?? 0);
  }

  get expiringCount(): number {
    return Number(this.summary?.expiringCount ?? this.summary?.expiring ?? 0);
  }

  private toPaise(rupees: string): number {
    return Math.round(parseFloat(rupees || '0') * 100) || 0;
  }

  private resetForm() {
    this.receive = { drugId: '', batchNo: '', qty: 10, mrpPaise: 0, costPaise: 0, expiryDate: '' };
    this.selectedName = '';
    this.mrpRupees = '';
    this.costRupees = '';
  }
}
