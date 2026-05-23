import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./routes";
import LoadingReact from "@/components/loading";
import { hasRole } from "@/utils/roleUtils";

const PublicRoute = () => {
    const { isAuthenticated, user, authReady } = useAuth();

    if (!authReady) {
        return <LoadingReact />;
    }

    return isAuthenticated && hasRole(user, 'admin')
        ? <Navigate to={ROUTES.DASHBOARD} replace />
        : <Outlet />;
}

export default PublicRoute;
