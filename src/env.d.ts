interface ImportMetaEnv {
    readonly VITE_PORT: string;
    readonly VITE_PREVIEW_PORT?: string;
    readonly VITE_HOST?: string;
    readonly VITE_API_URL: string;
    /** Comma-separated fallback API base URLs (same shape as VITE_API_URL). */
    readonly VITE_API_FALLBACK_URLS?: string;
    /** Optional axios timeout in ms (default 20000). */
    readonly VITE_API_TIMEOUT_MS?: string;
    readonly VITE_APP_NAME: string;
    readonly VITE_STITCH_API_KEY?: string;
    readonly VITE_STITCH_PROJECT_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}