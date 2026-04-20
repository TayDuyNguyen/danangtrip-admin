import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./routes";
import { hasRole } from "@/utils/roleUtils";
import LoadingReact from "@/components/loading";

const PrivateRoute = () => {
    const { isAuthenticated, user, authReady } = useAuth();
    
    if (!authReady) {
        return <LoadingReact />;
    }

    return (
        isAuthenticated && hasRole(user, 'admin') ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
    );
}

export default PrivateRoute;