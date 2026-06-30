/** Parse location id from POST /admin/locations success body (shape may vary). */
export function extractCreatedLocationId(res: unknown): number | null {
    if (!res || typeof res !== 'object') return null;
    const r = res as Record<string, unknown>;

    const parseId = (id: unknown): number | null => {
        if (typeof id === 'number' && !Number.isNaN(id)) return id;
        if (typeof id === 'string') {
            const n = parseInt(id, 10);
            return Number.isNaN(n) ? null : n;
        }
        return null;
    };

    if ('id' in r) {
        const direct = parseId(r.id);
        if (direct != null) return direct;
    }

    const data = r.data;
    if (!data || typeof data !== 'object') return null;
    if ('id' in data) {
        return parseId((data as { id: unknown }).id);
    }

    return null;
}
