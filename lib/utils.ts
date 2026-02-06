import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'Unknown';

  try {
    let date = new Date(dateStr);

    // Handle relative dates (e.g., "2 hours ago", "5 mins ago")
    if (date.toString() === 'Invalid Date') {
      const now = new Date();
      const lower = dateStr.toLowerCase();

      if (lower.includes('ago')) {
        const val = parseInt(lower.match(/\d+/)?.[0] || '0');
        if (lower.includes('min')) date = new Date(now.getTime() - val * 60000);
        else if (lower.includes('hour')) date = new Date(now.getTime() - val * 3600000);
        else if (lower.includes('day')) date = new Date(now.getTime() - val * 86400000);
        else if (lower.includes('week')) date = new Date(now.getTime() - val * 604800000);
        else if (lower.includes('month')) date = new Date(now.getTime() - val * 2592000000);
        else if (lower.includes('year')) date = new Date(now.getTime() - val * 31536000000);
      } else if (lower.includes('yesterday')) {
        date = new Date(now.getTime() - 86400000);
      } else if (lower.includes('today')) {
        date = now;
      }
    }

    if (date.toString() === 'Invalid Date') return dateStr;

    // Format: Feb 6, 2026, 11:08 AM
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
}
