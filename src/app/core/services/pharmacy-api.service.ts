import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PharmacyApiService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private base() {
    return `${environment.apiBaseUrl}/api/v1/projects/${this.auth.projectId}/pharmacy`;
  }

  private projectBase() {
    return `${environment.apiBaseUrl}/api/v1/projects/${this.auth.projectId}`;
  }

  listTasks(status?: string, q?: string) {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (q) params = params.set('q', q);
    return firstValueFrom(
      this.http.get<{ data: any[] }>(`${this.base()}/dispense-tasks`, { params })
    ).then((r) => r.data);
  }

  getTask(id: string) {
    return firstValueFrom(
      this.http.get<{ data: any }>(`${this.base()}/dispense-tasks/${id}`)
    ).then((r) => r.data);
  }

  claimTask(id: string) {
    return firstValueFrom(
      this.http.post<{ data: any }>(`${this.base()}/dispense-tasks/${id}/claim`, {})
    ).then((r) => r.data);
  }

  dispense(id: string, body: unknown) {
    return firstValueFrom(
      this.http.post<{ data: any }>(
        `${this.base()}/dispense-tasks/${id}/dispense`,
        body
      )
    ).then((r) => r.data);
  }

  updatePhone(id: string, phone: string) {
    return firstValueFrom(
      this.http.patch<{ data: any }>(`${this.base()}/dispense-tasks/${id}/phone`, {
        phone,
      })
    ).then((r) => r.data);
  }

  createSale(body: unknown) {
    return firstValueFrom(
      this.http.post<{ data: any }>(`${this.base()}/sales`, body)
    ).then((r) => r.data);
  }

  createReturn(body: unknown) {
    return firstValueFrom(
      this.http.post<{ data: any }>(`${this.base()}/returns`, body)
    ).then((r) => r.data);
  }

  analytics(from?: string, to?: string) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return firstValueFrom(
      this.http.get<{ data: any }>(`${this.base()}/analytics`, { params })
    ).then((r) => r.data);
  }

  barcode(code: string) {
    return firstValueFrom(
      this.http.get<{ data: any }>(`${this.base()}/barcode`, {
        params: new HttpParams().set('code', code),
      })
    ).then((r) => r.data);
  }

  whatsappShare(billId: string, body: { phone?: string; message?: string; sendDocument?: boolean }) {
    return firstValueFrom(
      this.http.post<{ data: any }>(
        `${this.base()}/bills/${billId}/whatsapp-share`,
        body
      )
    ).then((r) => r.data);
  }

  recordPayment(
    billId: string,
    body: { amountPaise: number; method: string; reference?: string }
  ) {
    return firstValueFrom(
      this.http.post<{ data: any }>(
        `${this.projectBase()}/bills/${billId}/payments`,
        body
      )
    ).then((r) => r.data);
  }

  getBill(billId: string) {
    return firstValueFrom(
      this.http.get<{ data: any }>(`${this.projectBase()}/bills/${billId}`)
    ).then((r) => r.data);
  }

  dayClose(date?: string) {
    return firstValueFrom(
      this.http.post<{ data: any }>(`${this.projectBase()}/payments/day-close`, {
        date: date || new Date().toISOString().slice(0, 10),
      })
    ).then((r) => r.data);
  }

  getDayClose(date?: string) {
    let params = new HttpParams().set(
      'date',
      date || new Date().toISOString().slice(0, 10)
    );
    return firstValueFrom(
      this.http.get<{ data: any }>(`${this.projectBase()}/payments/day-close`, {
        params,
      })
    ).then((r) => r.data);
  }

  inventorySummary() {
    return firstValueFrom(
      this.http.get<{ data: any }>(`${this.projectBase()}/inventory/summary`)
    ).then((r) => r.data);
  }

  searchDrugs(q: string) {
    return firstValueFrom(
      this.http.get<{ data: any[] }>(`${this.projectBase()}/drugs/search`, {
        params: new HttpParams().set('q', q).set('limit', '20'),
      })
    ).then((r) => r.data);
  }

  receiveLot(body: unknown) {
    return firstValueFrom(
      this.http.post<{ data: any }>(`${this.projectBase()}/inventory/lots`, body)
    ).then((r) => r.data);
  }

  listLots(drugId?: string) {
    let params = new HttpParams();
    if (drugId) params = params.set('drugId', drugId);
    return firstValueFrom(
      this.http.get<{ data: any[] }>(`${this.projectBase()}/inventory/lots`, {
        params,
      })
    ).then((r) => r.data);
  }
}
