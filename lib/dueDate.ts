import { supabase } from './supabase';

// Bundled fallback: the app works with no network.
export const DEFAULT_DUE_DATE_ISO = '2026-10-08'; // YYYY-MM-DD

function parseDueDate(value: string | null | undefined): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value ?? '').trim());
  if (!m) return new Date(2026, 9, 8);
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timed out')), ms),
    ),
  ]);
}

/** Shared due date from Supabase; falls back to the bundled date offline. */
export async function fetchDueDate(): Promise<Date> {
  if (!supabase) return parseDueDate(DEFAULT_DUE_DATE_ISO);
  try {
    const { data, error } = await withTimeout(
      supabase.from('mira_config').select('value').eq('key', 'due_date').single(),
      6000,
    );
    if (error || !data?.value) return parseDueDate(DEFAULT_DUE_DATE_ISO);
    return parseDueDate(data.value);
  } catch {
    return parseDueDate(DEFAULT_DUE_DATE_ISO);
  }
}

/** "October 8, 2026" for display. */
export function formatDueDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
