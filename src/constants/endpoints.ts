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
        // Top locations table/report
        TOP_LOCATIONS: '/admin/dashboard/top-locations',
        SEARCH_TRENDS: '/admin/dashboard/search-trends',
        // Recent orders table
        BOOKINGS: '/admin/bookings',
        EXPORT: '/admin/dashboard/export',
        // Notification bell - unread counts per category (polled every 30s)
        NOTIFICATION_COUNTS: '/admin/dashboard/notification-counts',
    },
    // Fallback endpoints for missing stats fields
    RATINGS: {
        LIST: '/admin/ratings',
        APPROVE: (id: string | number) => `/admin/ratings/${id}/approve`,
        REJECT: (id: string | number) => `/admin/ratings/${id}/reject`,
        MARK_VIEWED: (id: string | number) => `/admin/ratings/${id}/mark-viewed`,
        DELETE: (id: string | number) => `/admin/ratings/${id}`,
    },
    REPORTS: {
        RATINGS: '/admin/reports/ratings',
        BOOKINGS: '/admin/reports/bookings',
        REVENUE_DETAIL: '/admin/reports/revenue-detail',
        REVENUE_PAYMENTS_SUMMARY: '/admin/reports/revenue-payments-summary',
        LOCATIONS: '/admin/reports/locations',
        USERS: '/admin/reports/users',
    },
    CONTACTS: {
        LIST: '/admin/contacts',
        DETAIL: (id: string | number) => `/admin/contacts/${id}`,
        REPLY: (id: string | number) => `/admin/contacts/${id}/reply`,
        DELETE: (id: string | number) => `/admin/contacts/${id}`,
        EXPORT: '/admin/contacts/export',
    },
    NOTIFICATIONS: {
        LIST: '/admin/notifications',
        SEND: '/admin/notifications/send',
        SEND_ALL: '/admin/notifications/send-all',
        DELETE: (id: string | number) => `/admin/notifications/${id}`,
    },
    // Export endpoints
    EXPORT: {
        BOOKINGS: '/admin/bookings/export',
        PAYMENTS: '/admin/payments/export',
        TOURS: '/admin/tours/export',
        RATINGS: '/admin/ratings/export',
        LOCATIONS: '/admin/locations/export',
        USERS: '/admin/users/export',
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
        ADMIN_CATEGORY: (id: string | number) => `/admin/tour-categories/${id}`,
        ADMIN_CATEGORY_STATUS: (id: string | number) => `/admin/tour-categories/${id}/status`,
        ADMIN_CATEGORIES_REORDER: '/admin/tour-categories/reorder',
        PATCH_STATUS: (id: string | number) => `/admin/tours/${id}/status`,
        PATCH_FEATURED: (id: string | number) => `/admin/tours/${id}/featured`,
        PATCH_HOT: (id: string | number) => `/admin/tours/${id}/hot`,
    },
    // Media upload
    UPLOAD: {
        IMAGE: '/upload/image',
        IMAGES: '/upload/images',
        DELETE: '/upload/image',
    },
    // Bookings management
    BOOKINGS: {
        LIST: '/admin/bookings',
        STATUS_COUNTS: '/admin/bookings/status-counts',
        UPDATE_STATUS: (id: string | number) => `/admin/bookings/${id}/status`,
        CONFIRM_PAYMENT: (id: string | number) => `/admin/bookings/${id}/confirm-payment`,
        DETAIL: (id: string | number) => `/admin/bookings/${id}`,
        INVOICE: (id: string | number) => `/admin/bookings/${id}/invoice`,
        REFUND_PREVIEW: (id: string | number) => `/admin/bookings/${id}/refund-preview`,
    },
    // Payments management
    PAYMENTS: {
        LIST: '/admin/payments',
        DETAIL: (id: string | number) => `/admin/payments/${id}`,
        REFUND: (id: string | number) => `/admin/payments/${id}/refund`,
    },
    // Schedule management
    SCHEDULES: {
        LIST: '/admin/tour-schedules',
        STATUS_COUNTS: '/admin/tour-schedules/status-counts',
        DETAIL: (id: string | number) => `/admin/tour-schedules/${id}`,
        CREATE: (tourId: string | number) => `/admin/tours/${tourId}/schedules`,
        UPDATE: (id: string | number) => `/admin/tour-schedules/${id}`,
        DELETE: (id: string | number) => `/admin/tour-schedules/${id}`,
        PATCH_STATUS: (id: string | number) => `/admin/tour-schedules/${id}/status`,
    },
    // Locations management
    LOCATIONS: {
        LIST: '/admin/locations',
        STATS: '/admin/locations/stats',
        DETAIL: (id: string | number) => `/admin/locations/${id}`,
        CREATE: '/admin/locations',
        UPDATE: (id: string | number) => `/admin/locations/${id}`,
        DELETE: (id: string | number) => `/admin/locations/${id}`,
        PATCH_STATUS: (id: string | number) => `/admin/locations/${id}/status`,
        PATCH_FEATURED: (id: string | number) => `/admin/locations/${id}/featured`,
        CATEGORIES: '/categories',
        ADMIN_CATEGORIES: '/admin/categories',
        ADMIN_CATEGORY: (id: string | number) => `/admin/categories/${id}`,
        ADMIN_CATEGORY_STATUS: (id: string | number) => `/admin/categories/${id}/status`,
        ADMIN_CATEGORIES_REORDER: '/admin/categories/reorder',
        DISTRICTS: '/admin/locations/districts',
        TAGS: '/tags',
        AMENITIES: '/amenities',
        RATING_STATS: (id: string | number) => `/locations/${id}/rating-stats`,
        RATINGS: (id: string | number) => `/locations/${id}/ratings`,
    },
    // Users management
    USERS: {
        LIST: '/admin/users',
        DETAIL: (id: string | number) => `/admin/users/${id}`,
        UPDATE: (id: string | number) => `/admin/users/${id}`,
        BOOKINGS: (id: string | number) => `/admin/users/${id}/bookings`,
        RATINGS: (id: string | number) => `/admin/users/${id}/ratings`,
        UPDATE_ROLE: (id: string | number) => `/admin/users/${id}/role`,
        UPDATE_STATUS: (id: string | number) => `/admin/users/${id}/status`,
        DELETE: (id: string | number) => `/admin/users/${id}`,
    },
    // Blog Posts management
    BLOG: {
        LIST: '/admin/blog-posts',
        CREATE: '/admin/blog-posts',
        CHECK_SLUG: '/admin/blog-posts/check-slug',
        DETAIL: (id: string | number) => `/admin/blog-posts/${id}`,
        UPDATE: (id: string | number) => `/admin/blog-posts/${id}`,
        CATEGORIES: '/admin/blog-categories',
        CREATE_CATEGORY: '/admin/blog-categories',
        REORDER_CATEGORIES: '/admin/blog-categories/reorder',
        UPDATE_CATEGORY: (id: string | number) => `/admin/blog-categories/${id}`,
        DELETE_CATEGORY: (id: string | number) => `/admin/blog-categories/${id}`,
        PATCH_STATUS: (id: string | number) => `/admin/blog-posts/${id}/status`,
        DELETE: (id: string | number) => `/admin/blog-posts/${id}`,
    },
    CHATBOT: {
        STATS: '/admin/chatbot/stats',
        LOGS: '/admin/chatbot/logs',
        CACHE: '/admin/chatbot/cache',
        DELETE_CACHE: (hash: string | number) => `/admin/chatbot/cache/${hash}`,
        CLEAR_CACHE: '/admin/chatbot/cache',
    },
    SETTINGS: {
        GET: '/admin/settings',
        UPDATE: '/admin/settings',
    },
    PROMOTIONS: {
        LIST: '/admin/promotions',
        DETAIL: (id: string | number) => `/admin/promotions/${id}`,
        CREATE: '/admin/promotions',
        UPDATE: (id: string | number) => `/admin/promotions/${id}`,
        DELETE: (id: string | number) => `/admin/promotions/${id}`,
        PATCH_STATUS: (id: string | number) => `/admin/promotions/${id}/status`,
    },
    LANDING_PAGES: {
        LIST: '/admin/landing-pages',
        DETAIL: (id: string | number) => `/admin/landing-pages/${id}`,
        CREATE: '/admin/landing-pages',
        UPDATE: (id: string | number) => `/admin/landing-pages/${id}`,
        DELETE: (id: string | number) => `/admin/landing-pages/${id}`,
        PATCH_STATUS: (id: string | number) => `/admin/landing-pages/${id}/status`,
    },
} as const;

