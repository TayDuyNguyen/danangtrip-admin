import { isAxiosError } from 'axios';

export function isScheduleNotFoundError(error: unknown): boolean {
    return isAxiosError(error) && error.response?.status === 404;
}
