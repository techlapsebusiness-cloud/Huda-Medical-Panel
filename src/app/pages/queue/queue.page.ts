import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PharmacyApiService } from '../../core/services/pharmacy-api.service';
import { AuthService } from '../../core/services/auth.service';
import { CounterStateService } from '../../core/services/counter-state.service';
import { hudaStatusBadge, hudaWaitLabel, type HudaBadgeVariant } from '../../shared/ui';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.page.html',
  styleUrls: ['./queue.page.scss'],
  standalone: false,
})
export class QueuePage implements OnInit {
  tasks: any[] = [];
  q = '';
  loading = false;
  error = '';

  constructor(
    private api: PharmacyApiService,
    public auth: AuthService,
    private counter: CounterStateService,
    private router: Router
  ) {}

  ngOnInit() {
    void this.refresh();
  }

  async refresh(event?: CustomEvent) {
    this.loading = true;
    this.error = '';
    try {
      this.tasks = await this.api.listTasks(undefined, this.q || undefined);
      this.counter.setPending(this.pendingCount);
      try {
        const collect = await this.api.listCollectBills('unpaid,partial');
        this.counter.setCollect(collect.length);
      } catch {
        /* collect badge is best-effort */
      }
    } catch (e: any) {
      this.error = e?.error?.error?.message || 'Failed to load queue';
    } finally {
      this.loading = false;
      (event?.target as HTMLIonRefresherElement)?.complete?.();
    }
  }

  open(task: any) {
    void this.router.navigate(['/dispense', task.id]);
  }

  get pendingCount(): number {
    return this.tasks.filter((t) => t.status === 'pending').length;
  }

  get partialCount(): number {
    return this.tasks.filter((t) => t.status === 'partial').length;
  }

  get medicineCount(): number {
    return this.tasks.reduce((sum, t) => sum + (t.lines?.length || 0), 0);
  }

  /** Oldest open task — the one the counter should serve next. */
  get nextTask(): any | null {
    const open = this.tasks.filter((t) => t.status !== 'completed');
    if (!open.length) return null;
    return open.reduce((oldest, t) =>
      new Date(t.createdAt).getTime() < new Date(oldest.createdAt).getTime() ? t : oldest
    );
  }

  get longestWait(): string {
    const next = this.nextTask;
    return next ? hudaWaitLabel(next.createdAt) : '—';
  }

  get averageWait(): string {
    const open = this.tasks.filter((t) => t.status !== 'completed' && t.createdAt);
    if (!open.length) return '—';
    const total = open.reduce(
      (sum, t) => sum + (Date.now() - new Date(t.createdAt).getTime()),
      0
    );
    return `${Math.round(total / open.length / 60000)}m`;
  }

  waitMins(createdAt: string): string {
    return hudaWaitLabel(createdAt);
  }

  hasToken(task: any): boolean {
    return task?.appointmentToken !== null && task?.appointmentToken !== undefined;
  }

  badge(status: string): HudaBadgeVariant {
    return hudaStatusBadge(status);
  }
}
