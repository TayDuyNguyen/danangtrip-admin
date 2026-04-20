/** Parse tour id from POST /admin/tours success body (shape may vary). */
export function extractCreatedTourId(res: unknown): number | null {
    if (!res || typeof res !== "object") return null;
    const r = res as Record<string, unknown>;
    const data = r.data;
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const tour = d.tour;
    if (tour && typeof tour === "object" && "id" in tour) {
        const id = (tour as { id: unknown }).id;
        if (typeof id === "number" && !Number.isNaN(id)) return id;
        if (typeof id === "string") {
            const n = parseInt(id, 10);
            return Number.isNaN(n) ? null : n;
        }
    }
    if ("id" in d) {
        const id = d.id;
        if (typeof id === "number" && !Number.isNaN(id)) return id;
        if (typeof id === "string") {
            const n = parseInt(id, 10);
            return Number.isNaN(n) ? null : n;
        }
    }
    return null;
}
