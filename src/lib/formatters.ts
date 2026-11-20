import { EventSeverity } from '../types/events';

/**
 * Format ISO timestamps cleanly for SOC display
 */
export function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

/**
 * Relative time indicator (e.g., '2m ago', 'Just now')
 */
export function getRelativeTimeString(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return 'Just now';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return 'Recent';
  }
}

/**
 * Returns consistent Tailwind badge styles for given severity level
 */
export function getSeverityBadgeClass(severity: EventSeverity): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-950/80 text-red-300 border border-red-500/40';
    case 'high':
      return 'bg-orange-950/80 text-orange-300 border border-orange-500/40';
    case 'medium':
      return 'bg-amber-950/80 text-amber-300 border border-amber-500/40';
    case 'low':
      return 'bg-sky-950/80 text-sky-300 border border-sky-500/40';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}
