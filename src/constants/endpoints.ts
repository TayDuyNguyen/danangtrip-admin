export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh',
    },
    DASHBOARD: {
        GET_DASHBOARD: 'admin/dashboard',
        LOCATIONS: 'admin/reports/locations',
        RATINGS: 'admin/reports/ratings',
        USER: 'admin/reports/users',
        POINTS: 'admin/reports/points',
    }
} as const;
