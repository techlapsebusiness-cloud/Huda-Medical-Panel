import { Injectable, signal } from '@angular/core';

/**
 * Shell-visible counter state. Queue and collect pages publish counts here
 * so the sidebar badges stay accurate without a second poll.
 */
@Injectable({ providedIn: 'root' })
export class CounterStateService {
  readonly pendingCount = signal(0);
  readonly collectCount = signal(0);

  setPending(count: number): void {
    this.pendingCount.set(Math.max(0, count));
  }

  setCollect(count: number): void {
    this.collectCount.set(Math.max(0, count));
  }
}
