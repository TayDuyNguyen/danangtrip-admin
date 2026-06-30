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

type TemporalLike = string | Date | null | undefined;

function padTwo(value: number): string {
    return String(value).padStart(2, '0');
}

function parseMonthInput(value: string): Date {
    const [year, month] = value.split('-').map(Number);
    return new Date(year, (month || 1) - 1, 1, 12, 0, 0, 0);
}

function parseTemporal(value: TemporalLike): Date | null {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (/^\d{4}-\d{2}$/.test(value)) {
        const monthDate = parseMonthInput(value);
        return Number.isNaN(monthDate.getTime()) ? null : monthDate;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const dayDate = parseApiDateYmd(value);
        return Number.isNaN(dayDate.getTime()) ? null : dayDate;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function detectPrecision(value: TemporalLike): 'month' | 'date' | 'datetime' {
    if (!value) {
        return 'date';
    }

    if (value instanceof Date) {
        return value.getHours() || value.getMinutes() || value.getSeconds() || value.getMilliseconds()
            ? 'datetime'
            : 'date';
    }

    if (/^\d{4}-\d{2}$/.test(value)) {
        return 'month';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return 'date';
    }

    if (/([T\s])\d{2}:\d{2}/.test(value)) {
        return 'datetime';
    }

    return 'date';
}

export function formatAdminTableDate(value: TemporalLike): string {
    const date = parseTemporal(value);
    if (!date) {
        return typeof value === 'string' ? value : '';
    }

    return `${padTwo(date.getDate())}/${padTwo(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatAdminTableDateTime(value: TemporalLike): string {
    const date = parseTemporal(value);
    if (!date) {
        return typeof value === 'string' ? value : '';
    }

    return `${padTwo(date.getHours())}:${padTwo(date.getMinutes())} ${formatAdminTableDate(date)}`;
}

function formatAdminTableMonthYear(value: TemporalLike): string {
    const date = parseTemporal(value);
    if (!date) {
        return typeof value === 'string' ? value : '';
    }

    return `${padTwo(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatAdminTableTemporal(value: TemporalLike): string {
    switch (detectPrecision(value)) {
        case 'month':
            return formatAdminTableMonthYear(value);
        case 'datetime':
            return formatAdminTableDateTime(value);
        case 'date':
        default:
            return formatAdminTableDate(value);
    }
}

/**
 * Short date for admin tables (e.g. 15/04/2026).
 */
export function formatAdminShortDate(value: string, locale: string): string {
    void locale;
    return formatAdminTableDate(value);
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
