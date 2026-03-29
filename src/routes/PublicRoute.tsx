import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTERS } from "./routes";

const PublicRoute = () => {
    const {isAuthenticated} = useAuth()
    return !isAuthenticated ? <Outlet /> : <Navigate to={ROUTERS.HOME} />;
}

export default PublicRoute;