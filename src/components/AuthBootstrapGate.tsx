import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';

/**
 * AuthBootstrapGate - Handles silent auth refresh when app starts
 * This ensures users don't need to login again if refresh token is valid
 */
export function AuthBootstrapGate({ children }: { children: React.ReactNode }) {
  useAuthBootstrap();
  return <>{children}</>;
}
