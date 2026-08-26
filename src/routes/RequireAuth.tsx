import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}

export function RequireOnboardingNotDone() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.onboardingCompleted) {
    return <Navigate to="/dashboard/books" replace />;
  }

  return <Outlet />;
}

export function RedirectIfAuthed() {
  const { user } = useAuth();

  if (user) {
    return (
      <Navigate to={user.onboardingCompleted ? "/dashboard/books" : "/onboarding"} replace />
    );
  }

  return <Outlet />;
}
