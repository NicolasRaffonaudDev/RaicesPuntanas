import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import type { UserRole } from "../../types/auth";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) {
    return <div className="container py-8 text-sm text-[var(--color-text-muted)]">Validando sesion...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
