import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import type { Role } from "@/mock/mockData";

interface Props {
  allowedRoles?: Role[];
  children?: React.ReactNode;
}

const ProtectedRoute = ({ allowedRoles, children }: Props) => {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role))
    return <Navigate to="/dashboard" replace />;

  if (children) return <>{children}</>;

  return <Outlet />;
};

export default ProtectedRoute;
