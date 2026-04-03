import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "./routes";

const PublicRoute = () => {
    const { isAuthenticated } = useAuth()
    return isAuthenticated
        ? <Navigate to={ROUTES.DASHBOARD} replace />
        : <Outlet />;
}

export default PublicRoute;