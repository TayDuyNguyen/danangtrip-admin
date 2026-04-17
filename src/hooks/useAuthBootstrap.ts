import { useEffect, useRef } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { getAccessToken, getTokenExpiryMs } from '@/utils';
import { refreshAccessToken } from '@/api/axiosClient';

/**
 * Hook to handle initial authentication bootstrap when the app starts.
 * It checks if a session exists or attempts to restore it via refresh token.
 */
export const useAuthBootstrap = () => {
    const { user, setAuthReady } = useUserStore();
    const isBootstrapped = useRef(false);

    useEffect(() => {
        // Only run once
        if (isBootstrapped.current) return;
        isBootstrapped.current = true;

        const bootstrap = async () => {
            try {
                const token = getAccessToken();

                // 1. If we have a token that is still valid for at least 1 minute
                if (token && getTokenExpiryMs(token) > 60 * 1000 && user) {
                    setAuthReady(true);
                    return;
                }

                // 2. If token is missing or about to expire, try silent refresh via cookie
                // This works even if the user just opened a new tab/refreshed
                const newToken = await refreshAccessToken();
                
                if (!newToken) {
                    // Refresh failed or no session, ensure user is cleared
                    useUserStore.getState().logout();
                }
            } catch (error) {
                console.error('Auth bootstrap failed:', error);
                useUserStore.getState().logout();
            } finally {
                // Always mark auth as ready, even if it failed, so the router can proceed
                setAuthReady(true);
            }
        };

        bootstrap();
    }, [user, setAuthReady]);
};
