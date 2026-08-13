import { Injectable, signal } from '@angular/core';

/**
 * Shell-visible counter state. The queue page publishes its pending count here
 * so the sidebar badge stays accurate without a second poll.
 */
@Injectable({ providedIn: 'root' })
export class CounterStateService {
  readonly pendingCount = signal(0);

  setPending(count: number): void {
    this.pendingCount.set(Math.max(0, count));
  }
}
