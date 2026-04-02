import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTERS } from "./routes";
import { hasRole } from "@/utils/roleUtils";

const PrivateRoute = () => {
    const { isAuthenticated, user } = useAuth();
    return (
        isAuthenticated && hasRole(user, 'admin') ? <Outlet /> : <Navigate to={ROUTERS.LOGIN} />
    );
}

export default PrivateRoute;