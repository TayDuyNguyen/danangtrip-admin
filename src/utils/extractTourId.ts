/** Parse tour id from POST /admin/tours success body (shape may vary). */
export function extractCreatedTourId(res: unknown): number | null {
    if (!res || typeof res !== "object") return null;
    const r = res as Record<string, unknown>;

    const parseId = (id: unknown): number | null => {
        if (typeof id === "number" && !Number.isNaN(id)) return id;
        if (typeof id === "string") {
            const n = parseInt(id, 10);
            return Number.isNaN(n) ? null : n;
        }
        return null;
    };

    const fromTour = (container: Record<string, unknown>): number | null => {
        const tour = container.tour;
        if (tour && typeof tour === "object" && "id" in tour) {
            return parseId((tour as { id: unknown }).id);
        }
        if ("id" in container) {
            return parseId(container.id);
        }
        return null;
    };

    const direct = fromTour(r);
    if (direct != null) return direct;

    const data = r.data;
    if (!data || typeof data !== "object") return null;
    return fromTour(data as Record<string, unknown>);
}
