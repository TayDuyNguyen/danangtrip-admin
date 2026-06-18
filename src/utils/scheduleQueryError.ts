import { isAxiosError } from 'axios';

export function isScheduleNotFoundError(error: unknown): boolean {
    return isAxiosError(error) && error.response?.status === 404;
}

export function isScheduleServerError(error: unknown): boolean {
    return isAxiosError(error) && (error.response?.status ?? 0) >= 500;
}
