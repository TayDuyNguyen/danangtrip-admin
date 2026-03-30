import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import { ROUTERS } from './routes';

const Home = React.lazy(() => import('@/pages/Home'));
const Login = React.lazy(() => import('@/pages/Login'));
const Register = React.lazy(() => import('@/pages/Register'));
const PageNotFound = React.lazy(() => import('@/pages/PageNotFound'));
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
    // Public routes — chỉ truy cập khi chưa đăng nhập
    {
        element: <PublicRoute />,
        errorElement: <ErrorPage />,
        children: [
            { path: ROUTERS.LOGIN, element: withSuspense(Login) },
            { path: ROUTERS.REGISTER, element: withSuspense(Register) },
        ],
    },
    // Private routes — yêu cầu đăng nhập
    {
        element: <PrivateRoute />,
        errorElement: <ErrorPage />,
        children: [
            { path: ROUTERS.HOME, element: withSuspense(Home) },
        ],
    },
    {
        path: '*',
        element: withSuspense(PageNotFound)
    }
]);

const AppRoute = () => <RouterProvider router={router} />;

export default AppRoute;
