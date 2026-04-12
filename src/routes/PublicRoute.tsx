import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./routes";
import LoadingReact from "@/components/loading";

const PublicRoute = () => {
    const { isAuthenticated, authReady } = useAuth();

    if (!authReady) {
        return <LoadingReact />;
    }

    return isAuthenticated
        ? <Navigate to={ROUTES.DASHBOARD} replace />
        : <Outlet />;
}

export default PublicRoute;