import type { HudaBadgeVariant } from './huda-badge.component';

/** Map dispense / bill / stock status strings to `.huda-badge` variants. */
export function hudaStatusBadge(status: string): HudaBadgeVariant {
  const s = (status || '').toLowerCase().replace(/_/g, '-');
  if (
    [
      'completed',
      'paid',
      'sent',
      'active',
      'confirmed',
      'success',
      'dispensed',
      'restocked',
      'in-stock',
      'closed',
    ].includes(s)
  )
    return 'success';
  if (
    ['pending', 'pending-review', 'partial', 'scheduled', 'warning', 'low', 'expiring'].includes(s)
  )
    return 'warning';
  if (
    [
      'cancelled',
      'canceled',
      'no-show',
      'void',
      'failed',
      'danger',
      'out-of-stock',
      'expired',
      'written-off',
    ].includes(s)
  )
    return 'danger';
  if (['checked-in', 'in-progress', 'issued', 'unpaid', 'info', 'claimed', 'open', 'returned'].includes(s))
    return 'info';
  return 'neutral';
}

export function hudaInitials(name: string | null | undefined): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Paise → rupee string with Indian grouping. Amounts are stored as integer paise. */
export function hudaRupees(paise: number | null | undefined): string {
  const value = (Number(paise) || 0) / 100;
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Human wait time from an ISO timestamp, e.g. "12m" / "1h 04m". */
export function hudaWaitLabel(iso: string | null | undefined): string {
  if (!iso) return '—';
  const started = new Date(iso).getTime();
  if (Number.isNaN(started)) return '—';
  const mins = Math.max(0, Math.round((Date.now() - started) / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${String(mins % 60).padStart(2, '0')}m`;
}
