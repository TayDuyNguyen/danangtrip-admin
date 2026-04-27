export const ROUTES = {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    TOURS_LIST: '/admin/tours/list',
    TOURS_CREATE: '/admin/tours/create',
    TOURS_EDIT: '/admin/tours/edit/:id',
    TOURS_CATEGORIES: '/admin/tours/categories',
    TOURS_SCHEDULES: '/admin/tours/schedules',
    TOURS_SCHEDULE_CREATE: '/admin/tours/:id/schedules/create',
    TOURS_SCHEDULE_EDIT: '/admin/tours/schedules/edit/:id',
} as const;
