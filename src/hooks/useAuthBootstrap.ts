import { useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { getAccessToken, getTokenExpiryMs } from '@/utils';
import { refreshAccessToken } from '@/api/axiosClient';

/**
 * Hook to handle initial authentication bootstrap when the app starts.
 * It checks if a session exists or attempts to restore it via refresh token.
 */
let bootstrapPromise: Promise<void> | null = null;

const waitForUserStoreHydration = async () => {
    const persistApi = useUserStore.persist;

    if (persistApi.hasHydrated()) {
        return;
    }

    await new Promise<void>((resolve) => {
        const unsubscribe = persistApi.onFinishHydration(() => {
            unsubscribe();
            resolve();
        });
    });
};

const bootstrapAuthSession = async () => {
    await waitForUserStoreHydration();

    const { user } = useUserStore.getState();
    const token = getAccessToken();

    // Reuse the persisted session immediately when both user + token still exist.
    if (token && getTokenExpiryMs(token) > 60 * 1000 && user) {
        return;
    }

    const newToken = await refreshAccessToken();

    if (!newToken) {
        useUserStore.getState().logout();
    }
};

export const useAuthBootstrap = () => {
    const setAuthReady = useUserStore((state) => state.setAuthReady);

    useEffect(() => {
        if (useUserStore.getState().authReady) {
            return;
        }

        const runBootstrap = bootstrapPromise ?? (
            bootstrapPromise = bootstrapAuthSession()
                .catch((error) => {
                    console.error('Auth bootstrap failed:', error);
                    useUserStore.getState().logout();
                })
                .finally(() => {
                    useUserStore.getState().setAuthReady(true);
                    bootstrapPromise = null;
                })
        );

        void runBootstrap;
    }, [setAuthReady]);
};
