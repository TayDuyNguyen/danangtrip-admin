import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./routes";
import { canAccessAdminPanel } from '@/pages/Reports/shared/reportAccess';
import LoadingReact from "@/components/loading";

const PrivateRoute = () => {
    const { isAuthenticated, user, authReady } = useAuth();
    
    if (!authReady) {
        return <LoadingReact />;
    }

    return (
        isAuthenticated && canAccessAdminPanel(user) ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
    );
}

export default PrivateRoute;