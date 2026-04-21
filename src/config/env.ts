/**
 * Centralized API env for the admin SPA (primary URL, failover list, timeout).
 */
const normalizeApiBaseUrl = (url: string): string => {
    const t = url.trim();
    if (!t) return "";
    return t.replace(/\/+$/, "");
};

const parseFallbackUrls = (raw: string | undefined, primaryNorm: string): string[] => {
    if (!raw?.trim()) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const segment of raw.split(",")) {
        const n = normalizeApiBaseUrl(segment);
        if (!n || seen.has(n)) continue;
        if (primaryNorm && n === primaryNorm) continue;
        seen.add(n);
        out.push(n);
    }
    return out;
};

const parseTimeoutMs = (raw: string | undefined, fallback: number): number => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

const primaryNorm = normalizeApiBaseUrl(
    import.meta.env.VITE_API_URL || "https://danangtrip-api.onrender.com/api/v1"
);


const fallbackUrls = parseFallbackUrls(import.meta.env.VITE_API_FALLBACK_URLS, primaryNorm);


const seenChain = new Set<string>();
const baseChain: string[] = [];
for (const b of [primaryNorm, ...fallbackUrls]) {
    if (!b || seenChain.has(b)) continue;
    seenChain.add(b);
    baseChain.push(b);
}

export const apiClientEnv = {
    /** Normalized primary API base (VITE_API_URL) */
    primaryUrl: primaryNorm,
    /** Fallback bases only (comma-separated VITE_API_FALLBACK_URLS), normalized & deduped */
    fallbackUrls,
    /** [primary, ...fallbacks], unique preserve order */
    baseChain,
    /** Request timeout; default 20s for faster failover than legacy 60s */
    timeoutMs: parseTimeoutMs(import.meta.env.VITE_API_TIMEOUT_MS, 20_000),
} as const;
