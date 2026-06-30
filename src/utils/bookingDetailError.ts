import { isAxiosError } from 'axios';

export function isBookingDetailNotFoundError(error: unknown): boolean {
    if (!isAxiosError(error)) return false;
    const status = error.response?.status ?? 0;
    return status === 404 || status === 422;
}
