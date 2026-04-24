/**
 * Parse API date string (Y-m-d or ISO) to local Date at noon (avoid TZ shift).
 */
export function parseApiDateYmd(value: string): Date {
    const ymd = value.split('T')[0] ?? value;
    const parts = ymd.split('-').map((p) => Number(p));
    const [y, m, d] = parts;
    if (!y || !m || !d) {
        return new Date(NaN);
    }
    return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/**
 * Short date for admin tables (e.g. 15/04/2026).
 */
export function formatAdminShortDate(value: string, locale: string): string {
    const d = parseApiDateYmd(value);
    if (Number.isNaN(d.getTime())) {
        return value;
    }
    const loc = locale.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en-GB';
    return d.toLocaleDateString(loc, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Weekday label (long) for schedule rows.
 */
export function formatAdminWeekday(value: string, locale: string): string {
    const d = parseApiDateYmd(value);
    if (Number.isNaN(d.getTime())) {
        return '';
    }
    const loc = locale.toLowerCase().startsWith('vi') ? 'vi-VN' : 'en-GB';
    return d.toLocaleDateString(loc, { weekday: 'long' });
}

export function isWithinNextDays(value: string, days: number): boolean {
    const d = parseApiDateYmd(value);
    if (Number.isNaN(d.getTime())) {
        return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + days);
    const t = d.getTime();
    return t >= today.getTime() && t <= end.getTime();
}

export function isPastDate(value: string): boolean {
    const d = parseApiDateYmd(value);
    if (Number.isNaN(d.getTime())) {
        return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
}
