import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import type { Role } from "@/mock/mockData";

const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: Role[] }) => {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
