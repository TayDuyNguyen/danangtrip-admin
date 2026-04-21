import "axios";

declare module "axios" {
    interface AxiosRequestConfig {
        /** When true, network errors skip nested failover (outer loop tries next base). */
        __isFailoverRetry?: boolean;
        /** Single retry guard for 401 refresh flow. */
        _retry?: boolean;
    }
}
