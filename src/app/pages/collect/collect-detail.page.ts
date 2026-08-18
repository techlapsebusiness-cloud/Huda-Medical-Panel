import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';
import { CounterStateService } from '../../core/services/counter-state.service';
import { hudaRupees, hudaStatusBadge, type HudaBadgeVariant } from '../../shared/ui';

@Component({
  selector: 'app-collect-detail',
  templateUrl: './collect-detail.page.html',
  styleUrls: ['./collect-detail.page.scss'],
  standalone: false,
})
export class CollectDetailPage implements OnInit {
  billId = '';
  bill: any = null;
  phone = '';
  loading = true;
  busy = false;
  payMethod: 'cash' | 'upi' | 'card' = 'cash';
  payAmountRupees = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: PharmacyApiService,
    private counter: CounterStateService,
    private toast: ToastController,
    private alert: AlertController
  ) {}

  async ngOnInit() {
    this.billId = this.route.snapshot.paramMap.get('billId') || '';
    await this.load();
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      this.bill = await this.api.getBill(this.billId);
      this.phone = this.bill.patientPhone || '';
      this.payAmountRupees = (this.balancePaise / 100).toFixed(2);
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Failed to load bill';
    } finally {
      this.loading = false;
    }
  }

  async recordPayment() {
    if (!this.bill?.id) return;
    this.busy = true;
    this.error = '';
    try {
      const amountPaise = Math.round(parseFloat(this.payAmountRupees || '0') * 100);
      await this.api.recordPayment(this.bill.id, {
        amountPaise,
        method: this.payMethod,
      });
      this.bill = await this.api.getBill(this.bill.id);
      this.payAmountRupees = (this.balancePaise / 100).toFixed(2);
      if (this.isPaid) {
        const remaining = await this.api.listCollectBills('unpaid,partial');
        this.counter.setCollect(remaining.length);
      }
      const t = await this.toast.create({
        message: this.isPaid ? 'Payment collected' : 'Partial payment recorded',
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

  get balancePaise(): number {
    if (!this.bill) return 0;
    return Math.max(0, (this.bill.grandTotalPaise || 0) - (this.bill.amountPaidPaise || 0));
  }

  get isPaid(): boolean {
    return this.bill?.paymentStatus === 'paid';
  }

  done() {
    void this.router.navigate(['/collect']);
  }
}
