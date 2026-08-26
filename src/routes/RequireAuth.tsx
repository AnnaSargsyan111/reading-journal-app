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

  // Stay on the onboarding page through the moment onboarding is completed so the
  // Welcome Modal (shown by TellUsAboutYourselfPage itself) can render. Only bounce
  // away once the modal has actually been seen and dismissed.
  if (user.onboardingCompleted && user.onboardingSeenWelcome) {
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
