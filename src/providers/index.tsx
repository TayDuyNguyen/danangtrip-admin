import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { useUserStore } from '@/store/useUserStore';
import LoadingReact from '@/components/loading';

interface AppProvidersProps {
    children: ReactNode;
}

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
});

/**
 * Component that initializes authentication and blocks rendering until ready
 */
function AuthBootstrapGate({ children }: { children: ReactNode }) {
    useAuthBootstrap();
    const authReady = useUserStore((state) => state.authReady);

    if (!authReady) {
        return <LoadingReact />;
    }

    return <>{children}</>;
}

export default function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthBootstrapGate>
                {children}
            </AuthBootstrapGate>
        </QueryClientProvider>
    );
}
