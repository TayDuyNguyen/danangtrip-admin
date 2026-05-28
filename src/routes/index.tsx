import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import { ROUTES } from './routes';
import MainLayout from '@/layouts/MainLayout';

const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Login = React.lazy(() => import('@/pages/Login'));
const PageNotFound = React.lazy(() => import('@/pages/PageNotFound'));
const TourList = React.lazy(() => import('@/pages/Tours/TourList'));
const AddTour = React.lazy(() => import('@/pages/Tours/TourCreate'));
const EditTour = React.lazy(() => import('@/pages/Tours/TourEdit'));
const TourCategories = React.lazy(() => import('@/pages/Tours/TourCategories'));
const Schedules = React.lazy(() => import('@/pages/Tours/TourSchedules'));
const TourScheduleCreate = React.lazy(() => import('@/pages/Tours/TourScheduleCreate'));
const TourScheduleEdit = React.lazy(() => import('@/pages/Tours/TourScheduleEdit'));
const LocationList = React.lazy(() => import('@/pages/Locations/LocationList'));
const LocationCreate = React.lazy(() => import('@/pages/Locations/LocationCreate'));
const LocationEdit = React.lazy(() => import('@/pages/Locations/LocationEdit'));
const LocationDetail = React.lazy(() => import('@/pages/Locations/LocationDetail'));
const LocationCategories = React.lazy(() => import('@/pages/Locations/LocationCategories'));
const BookingList = React.lazy(() => import('@/pages/Bookings/BookingList'));
const BookingDetail = React.lazy(() => import('@/pages/Bookings/BookingDetail'));
const PaymentList = React.lazy(() => import('@/pages/Payments/PaymentList'));
const PaymentDetail = React.lazy(() => import('@/pages/Payments/PaymentDetail'));
const RatingsReport = React.lazy(() => import('@/pages/Reports/RatingsReport'));
const BookingsReport = React.lazy(() => import('@/pages/Reports/BookingsReport'));
const RevenueReport = React.lazy(() => import('@/pages/Reports/RevenueReport'));
const LocationReport = React.lazy(() => import('@/pages/Reports/LocationReport'));
const UsersReport = React.lazy(() => import('@/pages/Reports/UsersReport'));
const UserList = React.lazy(() => import('@/pages/Users/UserList'));
const UserCreate = React.lazy(() => import('@/pages/Users/UserCreate'));
const UserDetail = React.lazy(() => import('@/pages/Users/UserDetail'));
const UserEdit = React.lazy(() => import('@/pages/Users/UserEdit'));
const Contacts = React.lazy(() => import('@/pages/Contacts'));
const NotificationList = React.lazy(() => import('@/pages/Notifications/NotificationList'));
const NotificationSend = React.lazy(() => import('@/pages/Notifications/NotificationSend'));
const BlogPostList = React.lazy(() => import('@/pages/Blog/BlogPostList'));
const BlogPostCreate = React.lazy(() => import('@/pages/Blog/BlogPostCreate'));
const BlogPostEdit = React.lazy(() => import('@/pages/Blog/BlogPostEdit'));
const BlogPostDetail = React.lazy(() => import('@/pages/Blog/BlogPostDetail'));
const BlogCategories = React.lazy(() => import('@/pages/Blog/BlogCategories'));
import ErrorPage from '@/pages/ErrorPage';


/**
 * Page loader component
 */
const PageLoader = () => (
    <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
    </div>
);

/**
 * Suspense wrapper component
 */
const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);


/**
 * Router component
 */
const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to={ROUTES.LOGIN} replace />,
        errorElement: <ErrorPage />
    },
    {
        element: <PublicRoute />,
        errorElement: <ErrorPage />,
        children: [
            { path: ROUTES.LOGIN, element: withSuspense(Login) },
        ],
    },
    {
        element: <PrivateRoute />,
        errorElement: <ErrorPage />,
        children: [
            {
                element: <MainLayout />,
                children: [
                    { path: ROUTES.DASHBOARD, element: withSuspense(Dashboard) },
                    { path: '/admin/tours/categories', element: <Navigate to={ROUTES.TOURS_CATEGORIES} replace /> },
                    { path: '/admin/locations/categories', element: <Navigate to={ROUTES.LOCATIONS_CATEGORIES} replace /> },
                    { path: ROUTES.TOURS_LIST, element: withSuspense(TourList) },
                    { path: ROUTES.TOURS_CREATE, element: withSuspense(AddTour) },
                    { path: ROUTES.TOURS_EDIT, element: withSuspense(EditTour) },
                    { path: ROUTES.TOURS_CATEGORIES, element: withSuspense(TourCategories) },
                    { path: ROUTES.TOURS_SCHEDULES, element: withSuspense(Schedules) },
                    { path: ROUTES.TOURS_SCHEDULE_CREATE, element: withSuspense(TourScheduleCreate) },
                    { path: ROUTES.TOURS_SCHEDULE_EDIT, element: withSuspense(TourScheduleEdit) },
                    { path: ROUTES.LOCATIONS_LIST, element: withSuspense(LocationList) },
                    { path: ROUTES.LOCATIONS_CREATE, element: withSuspense(LocationCreate) },
                    { path: ROUTES.LOCATIONS_EDIT, element: withSuspense(LocationEdit) },
                    { path: ROUTES.LOCATIONS_DETAIL, element: withSuspense(LocationDetail) },
                    { path: ROUTES.LOCATIONS_CATEGORIES, element: withSuspense(LocationCategories) },
                    { path: ROUTES.BOOKINGS_LIST, element: withSuspense(BookingList) },
                    { path: ROUTES.BOOKINGS_DETAIL, element: withSuspense(BookingDetail) },
                    { path: ROUTES.PAYMENTS_LIST, element: withSuspense(PaymentList) },
                    { path: ROUTES.PAYMENTS_DETAIL, element: withSuspense(PaymentDetail) },
                    { path: ROUTES.REPORTS_RATINGS, element: withSuspense(RatingsReport) },
                    { path: ROUTES.REPORTS_BOOKINGS, element: withSuspense(BookingsReport) },
                    { path: ROUTES.REPORTS_REVENUE, element: withSuspense(RevenueReport) },
                    { path: ROUTES.REPORTS_LOCATIONS, element: withSuspense(LocationReport) },
                    { path: ROUTES.REPORTS_USERS, element: withSuspense(UsersReport) },
                    { path: ROUTES.USERS_LIST, element: withSuspense(UserList) },
                    { path: ROUTES.USERS_CREATE, element: withSuspense(UserCreate) },
                    { path: ROUTES.USERS_DETAIL, element: withSuspense(UserDetail) },
                    { path: ROUTES.USERS_EDIT, element: withSuspense(UserEdit) },
                    { path: ROUTES.NOTIFICATIONS, element: withSuspense(NotificationList) },
                    { path: ROUTES.NOTIFICATIONS_SEND, element: withSuspense(NotificationSend) },
                    { path: ROUTES.CONTACTS, element: withSuspense(Contacts) },
                    { path: ROUTES.BLOG_POSTS, element: withSuspense(BlogPostList) },
                    { path: ROUTES.BLOG_POSTS_CREATE, element: withSuspense(BlogPostCreate) },
                    { path: ROUTES.BLOG_POSTS_EDIT, element: withSuspense(BlogPostEdit) },
                    { path: ROUTES.BLOG_POSTS_DETAIL, element: withSuspense(BlogPostDetail) },
                    { path: ROUTES.BLOG_CATEGORIES, element: withSuspense(BlogCategories) },
                ]
            }

        ],
    },
    {
        path: '*',
        element: withSuspense(PageNotFound)
    }
]);

const AppRoute = () => <RouterProvider router={router} />;

export default AppRoute;
