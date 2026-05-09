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
import ErrorPage from '@/pages/ErrorPage';

/**
 * Page loader component
 * (Component để hiển thị loader khi tải trang)
 */
const PageLoader = () => (
    <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
    </div>
);

/**
 * Suspense wrapper component
 * (Component để wrap component với Suspense để hiển thị loader khi tải trang)
 */
const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

/**
 * Router component
 * (Component để định nghĩa đường dẫn của ứng dụng)
 */
const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to={ROUTES.LOGIN} replace />,
        errorElement: <ErrorPage />
    },
    // Public routes — chỉ truy cập khi chưa đăng nhập
    {
        element: <PublicRoute />,
        errorElement: <ErrorPage />,
        children: [
            { path: ROUTES.LOGIN, element: withSuspense(Login) },
        ],
    },
    // Private routes — yêu cầu đăng nhập
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
