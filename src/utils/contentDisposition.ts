/** Read Content-Disposition value from Axios/fetch headers (case-insensitive key). */
export function getContentDispositionHeader(headers: Record<string, unknown>): string | undefined {
    const entry = Object.entries(headers).find(([k]) => k.toLowerCase() === 'content-disposition');
    const v = entry?.[1];
    if (typeof v === 'string') return v;
    if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
    return undefined;
}

/**
 * Parse filename from Content-Disposition (filename + filename* UTF-8, RFC 5987).
 */
export function parseContentDispositionFilename(header: string | undefined): string | null {
    if (!header || typeof header !== 'string') return null;

    const segments = header
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);

    let fromStar: string | null = null;
    let fromPlain: string | null = null;

    for (const seg of segments) {
        const lower = seg.toLowerCase();
        if (lower.startsWith('filename*=')) {
            const rest = seg.slice('filename*='.length).trim();
            const m = /^([^']*)'[^']*'(.+)$/i.exec(rest);
            if (m?.[2]) {
                try {
                    fromStar = decodeURIComponent(m[2].replace(/\+/g, ' '));
                } catch {
                    /* ignore decode errors */
                }
            }
        } else if (lower.startsWith('filename=')) {
            let v = seg.slice('filename='.length).trim();
            if (v.startsWith('"')) {
                const end = v.lastIndexOf('"');
                if (end > 0) v = v.slice(1, end).replace(/\\"/g, '"');
            }
            fromPlain = v;
        }
    }

    const raw = fromStar ?? fromPlain;
    if (!raw) return null;

    const parts = raw.split(/[/\\]/);
    return parts[parts.length - 1] || raw;
}

const INVALID_WIN_FILENAME_CHARS = new Set('<>:"/\\|?*'.split(''));

/** Strip characters invalid in Windows / common filesystems (no control chars in RegExp — ESLint no-control-regex). */
export function sanitizeDownloadFilename(name: string, maxLen = 180): string {
    const cleaned = [...name]
        .map((ch) => {
            const code = ch.charCodeAt(0);
            if (code >= 0 && code <= 31) return '-';
            if (INVALID_WIN_FILENAME_CHARS.has(ch)) return '-';
            return ch;
        })
        .join('')
        .trim();
    const base = cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
    return base || 'download';
}
