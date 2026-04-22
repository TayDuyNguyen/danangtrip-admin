export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH_TOKEN: '/auth/refresh',
    },
    DASHBOARD: {
        // Stats (cards row 1 & 2 + order status)
        STATS: '/admin/dashboard/stats',
        // Booking status counts for Order Status chart
        BOOKING_STATUS_COUNTS: '/admin/bookings/status-counts',
        // Line chart - revenue by period
        REVENUE: '/admin/dashboard/revenue',
        // Stacked bar - booking trend
        BOOKING_TREND: '/admin/dashboard/booking-trend',
        // Area chart - user growth
        USER_GROWTH: '/admin/dashboard/user-growth',
        // Top 5 tours table
        TOP_TOURS: '/admin/dashboard/top-tours',
        // Recent orders table
        BOOKINGS: '/admin/bookings',
    },
    // Fallback endpoints for missing stats fields
    RATINGS: {
        LIST: '/admin/ratings',
    },
    CONTACTS: {
        LIST: '/admin/contacts',
    },
    // Export endpoints
    EXPORT: {
        BOOKINGS: '/admin/bookings/export',
        PAYMENTS: '/admin/payments/export',
        TOURS: '/admin/tours/export',
    },
    // Tours management
    TOURS: {
        LIST: '/admin/tours',
        DETAIL: (id: string | number) => `/admin/tours/${id}`,
        CREATE: '/admin/tours',
        UPDATE: (id: string | number) => `/admin/tours/${id}`,
        DELETE: (id: string | number) => `/admin/tours/${id}`,
        CATEGORIES: '/tour-categories',
        ADMIN_CATEGORIES: '/admin/tour-categories',
        PATCH_STATUS: (id: string | number) => `/admin/tours/${id}/status`,
        PATCH_FEATURED: (id: string | number) => `/admin/tours/${id}/featured`,
        PATCH_HOT: (id: string | number) => `/admin/tours/${id}/hot`,
    },
    // Media upload
    UPLOAD: {
        IMAGE: '/upload/image',
        IMAGES: '/upload/images',
        DELETE: '/upload/image',
    }
} as const;
