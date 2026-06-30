import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { mapApiErrorMessage } from './apiError';

/**
 * Returns true when the axios response interceptor already showed a global toast
 * (network failure after failover, or 403 permission denied).
 */
function isGlobalApiErrorToastHandled(error: unknown): boolean {
    if (!isAxiosError(error)) {
        return false;
    }
    if (!error.response) {
        return true;
    }
    return error.response.status === 403;
}

export function showMutationErrorToast(fallback: string, error?: unknown): void {
    if (error !== undefined && isGlobalApiErrorToastHandled(error)) {
        return;
    }
    if (error instanceof Error && !isAxiosError(error)) {
        toast.error(error.message.trim() || fallback);
        return;
    }
    toast.error(mapApiErrorMessage(fallback, error));
}
