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
const PaymentList = React.lazy(() => import('@/pages/Payments/PaymentList'));
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
                    { path: ROUTES.PAYMENTS_LIST, element: withSuspense(PaymentList) },
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
