import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/store';
import { ROUTES } from '@/routes/routes';
import { canAccessReports } from './reportAccess';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';

/** Restricts report routes to admin/manager; staff → dashboard */
const ReportsAccessRoute = () => {
    const { user, authReady } = useAuth();
    const { t } = useTranslation('reports_common');
    const notifiedRef = useRef(false);

    useEffect(() => {
        if (authReady && user && !canAccessReports(user) && !notifiedRef.current) {
            notifiedRef.current = true;
            toast.error(t('access.denied_toast'));
        }
    }, [authReady, user, t]);

    if (!authReady) {
        return null;
    }

    if (!canAccessReports(user)) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return <Outlet />;
};

export default ReportsAccessRoute;
