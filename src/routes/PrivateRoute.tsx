import { useAuth } from "@/store"
import { Navigate, Outlet } from "react-router-dom";
import { ROUTERS } from "./routes";

const PrivateRoute = () => {
    const {isAuthenticated} = useAuth();
    return isAuthenticated ? <Outlet /> : <Navigate to={ROUTERS.LOGIN} />;
   }

export default PrivateRoute;