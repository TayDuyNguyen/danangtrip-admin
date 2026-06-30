export function getStableMockFactor(seed: number, min: number, max: number): number {
    const normalized = ((seed * 9301 + 49297) % 233280) / 233280;
    return min + normalized * (max - min);
}
