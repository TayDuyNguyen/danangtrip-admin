import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./routes";
import { hasRole } from "@/utils/roleUtils";

const PrivateRoute = () => {
    const { isAuthenticated, user } = useAuth();
    console.log(user);
    return (
        isAuthenticated && hasRole(user, 'admin') ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />
    );
}

export default PrivateRoute;