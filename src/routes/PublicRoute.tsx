import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./routes";
import LoadingReact from "@/components/loading";
import { canAccessAdminPanel } from '@/pages/Reports/shared/reportAccess';

const PublicRoute = () => {
    const { isAuthenticated, user, authReady } = useAuth();

    if (!authReady) {
        return <LoadingReact />;
    }

    return isAuthenticated && canAccessAdminPanel(user)
        ? <Navigate to={ROUTES.DASHBOARD} replace />
        : <Outlet />;
}

export default PublicRoute;
