import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';
import { CounterStateService } from '../../core/services/counter-state.service';
import { AlertController, ToastController } from '@ionic/angular';
import { hudaRupees, hudaStatusBadge, type HudaBadgeVariant } from '../../shared/ui';

/** Lots within this window are flagged amber so the counter rotates them first. */
const EXPIRY_WARNING_DAYS = 90;

@Component({
  selector: 'app-dispense',
  templateUrl: './dispense.page.html',
  styleUrls: ['./dispense.page.scss'],
  standalone: false,
})
export class DispensePage implements OnInit, OnDestroy {
  taskId = '';
  task: any = null;
  lineQty: Record<string, number> = {};
  lineOos: Record<string, boolean> = {};
  phone = '';
  loading = true;
  busy = false;
  bill: any = null;
  payMethod: 'cash' | 'upi' | 'card' = 'cash';
  payAmountRupees = '';
  error = '';
  private poll?: ReturnType<typeof setInterval>;

  constructor(
    private route: ActivatedRoute,
    private api: PharmacyApiService,
    private counter: CounterStateService,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  async ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    await this.load();
    this.poll = setInterval(() => {
      if (!this.busy) void this.load();
    }, 10_000);
  }

  ngOnDestroy() {
    if (this.poll) clearInterval(this.poll);
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      this.task = await this.api.getTask(this.taskId);
      this.phone = this.task.patientPhone || '';
      for (const l of this.task.lines || []) {
        const remaining = Math.max(0, (l.requestedQty || 0) - (l.dispensedQty || 0));
        this.lineQty[l.medicineRowId] = remaining;
        this.lineOos[l.medicineRowId] = false;
      }
      if (this.task.status === 'pending') {
        await this.api.claimTask(this.taskId);
        this.task = await this.api.getTask(this.taskId);
      }
      if (this.task.pharmacyBillId) {
        this.bill = await this.api.getBill(this.task.pharmacyBillId);
        this.payAmountRupees = (
          ((this.bill.grandTotalPaise || 0) - (this.bill.amountPaidPaise || 0)) /
          100
        ).toFixed(2);
      }
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Failed to load task';
    } finally {
      this.loading = false;
    }
  }

  suggestion(rowId: string) {
    return (this.task?.fefoSuggestions || []).find(
      (s: any) => s.medicineRowId === rowId
    );
  }

  async complete() {
    this.busy = true;
    this.error = '';
    try {
      const lines = (this.task.lines || []).map((l: any) => ({
        medicineRowId: l.medicineRowId,
        dispensedQty: this.lineOos[l.medicineRowId]
          ? 0
          : this.lineQty[l.medicineRowId] ?? 0,
        outOfStock: !!this.lineOos[l.medicineRowId],
      }));
      const result = await this.api.dispense(this.taskId, {
        lines,
        customerPhone: this.phone,
      });
      this.task = result.task;
      this.bill = result.bill;
      if (this.bill) {
        this.payAmountRupees = ((this.bill.grandTotalPaise || 0) / 100).toFixed(2);
        try {
          const collect = await this.api.listCollectBills('unpaid,partial');
          this.counter.setCollect(collect.length);
        } catch {
          /* badge is best-effort */
        }
      }
      const t = await this.toast.create({
        message: this.bill
          ? 'Dispense saved — collect payment below or in Bill & Collect'
          : 'Dispense saved',
        duration: 2500,
        color: 'success',
      });
      await t.present();
    } catch (e: any) {
      this.error = e?.error?.error?.message || e?.message || 'Dispense failed';
    } finally {
      this.busy = false;
    }
  }

  async recordPayment() {
    if (!this.bill?.id) return;
    this.busy = true;
    try {
      const amountPaise = Math.round(parseFloat(this.payAmountRupees || '0') * 100);
      await this.api.recordPayment(this.bill.id, {
        amountPaise,
        method: this.payMethod,
      });
      this.bill = await this.api.getBill(this.bill.id);
      const t = await this.toast.create({
        message: 'Payment recorded',
        duration: 2000,
        color: 'success',
      });
      await t.present();
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Payment failed';
    } finally {
      this.busy = false;
    }
  }

  async whatsapp(sendDocument = false) {
    if (!this.bill?.id) return;
    this.busy = true;
    try {
      const share = await this.api.whatsappShare(this.bill.id, {
        phone: this.phone,
        sendDocument,
      });
      if (share.waUrl) {
        window.open(share.waUrl, '_blank');
      }
      if (share.pdfUrl) {
        const a = await this.alert.create({
          header: 'Share bill PDF',
          message:
            'WhatsApp chat opened. Attach the bill PDF from the next step (or open the PDF link).',
          buttons: [
            {
              text: 'Open PDF',
              handler: () => {
                window.open(share.pdfUrl, '_blank');
              },
            },
            { text: 'OK' },
          ],
        });
        await a.present();
      }
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'WhatsApp share failed';
    } finally {
      this.busy = false;
    }
  }

  rupees(paise: number) {
    return hudaRupees(paise);
  }

  badge(status: string): HudaBadgeVariant {
    return hudaStatusBadge(status);
  }

  remaining(line: any): number {
    return Math.max(0, (line.requestedQty || 0) - (line.dispensedQty || 0));
  }

  step(rowId: string, delta: number): void {
    const next = (this.lineQty[rowId] ?? 0) + delta;
    this.lineQty[rowId] = Math.max(0, next);
  }

  expiringSoon(expiryDate: string): boolean {
    const expiry = new Date(expiryDate).getTime();
    if (Number.isNaN(expiry)) return false;
    return expiry - Date.now() < EXPIRY_WARNING_DAYS * 86400000;
  }

  get totalToDispense(): number {
    return (this.task?.lines || []).reduce(
      (sum: number, l: any) =>
        sum + (this.lineOos[l.medicineRowId] ? 0 : this.lineQty[l.medicineRowId] ?? 0),
      0
    );
  }

  get oosCount(): number {
    return (this.task?.lines || []).filter((l: any) => this.lineOos[l.medicineRowId]).length;
  }

  get balancePaise(): number {
    if (!this.bill) return 0;
    return Math.max(0, (this.bill.grandTotalPaise || 0) - (this.bill.amountPaidPaise || 0));
  }

  get isPaid(): boolean {
    return this.bill?.paymentStatus === 'paid';
  }

  get hasToken(): boolean {
    return this.task?.appointmentToken !== null && this.task?.appointmentToken !== undefined;
  }
}
