export type RangePreset = 'today' | '7d' | '30d' | 'mtd' | '90d' | 'ytd' | 'all' | 'custom';
export type Bucket = 'hour' | 'day' | 'week' | 'month';

export interface RangeBounds {
  start: Date;
  end: Date;
  bucket: Bucket;
  label: string;
  preset: RangePreset;
}

export const PRESET_LABELS: Record<RangePreset, string> = {
  today: 'Hoy',
  '7d': '7 días',
  '30d': '30 días',
  mtd: 'Este mes',
  '90d': '90 días',
  ytd: 'Este año',
  all: 'Todo',
  custom: 'Personalizado',
};

export function getRangeBounds(preset: RangePreset, customStart?: Date, customEnd?: Date): RangeBounds {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const tomorrow = new Date(endOfDay);
  tomorrow.setMilliseconds(tomorrow.getMilliseconds() + 1);

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return { start: startOfToday, end: tomorrow, bucket: 'hour', label: 'Hoy', preset };
    case '7d': {
      const s = new Date(startOfToday);
      s.setDate(s.getDate() - 6);
      return { start: s, end: tomorrow, bucket: 'day', label: 'Últimos 7 días', preset };
    }
    case '30d': {
      const s = new Date(startOfToday);
      s.setDate(s.getDate() - 29);
      return { start: s, end: tomorrow, bucket: 'day', label: 'Últimos 30 días', preset };
    }
    case 'mtd': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: s, end: tomorrow, bucket: 'day', label: 'Este mes', preset };
    }
    case '90d': {
      const s = new Date(startOfToday);
      s.setDate(s.getDate() - 89);
      return { start: s, end: tomorrow, bucket: 'week', label: 'Últimos 90 días', preset };
    }
    case 'ytd': {
      const s = new Date(now.getFullYear(), 0, 1);
      return { start: s, end: tomorrow, bucket: 'month', label: 'Este año', preset };
    }
    case 'all': {
      const s = new Date(2020, 0, 1);
      return { start: s, end: tomorrow, bucket: 'month', label: 'Todo el histórico', preset };
    }
    case 'custom': {
      const s = customStart ?? startOfToday;
      const e = customEnd ?? tomorrow;
      const days = Math.max(1, Math.ceil((e.getTime() - s.getTime()) / 86400000));
      const bucket: Bucket = days <= 2 ? 'hour' : days <= 60 ? 'day' : days <= 200 ? 'week' : 'month';
      return {
        start: s,
        end: e,
        bucket,
        label: `${s.toLocaleDateString('es-ES')} – ${new Date(e.getTime() - 1).toLocaleDateString('es-ES')}`,
        preset,
      };
    }
  }
}

export function formatBucketLabel(date: Date, bucket: Bucket): string {
  switch (bucket) {
    case 'hour':
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    case 'day':
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    case 'week':
      return `Sem. ${date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}`;
    case 'month':
      return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
  }
}
