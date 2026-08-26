import { Navigate, Route, Routes } from "react-router-dom";
import { RegistrationPage } from "./pages/auth/RegistrationPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { TellUsAboutYourselfPage } from "./pages/onboarding/TellUsAboutYourselfPage";
import { AppShell } from "./layout/AppShell";
import { AboutMePage } from "./pages/dashboard/AboutMePage";
import { BooksPage } from "./pages/dashboard/BooksPage";
import { BookFormPage } from "./pages/dashboard/BookFormPage";
import { MysteryBookPage } from "./pages/dashboard/MysteryBookPage";
import { RedirectIfAuthed, RequireAuth, RequireOnboardingNotDone } from "./routes/RequireAuth";

function App() {
  return (
    <Routes>
      <Route index element={<Navigate to="/login" replace />} />

      <Route element={<RedirectIfAuthed />}>
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<RequireOnboardingNotDone />}>
        <Route path="/onboarding" element={<TellUsAboutYourselfPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard/books" replace />} />
          <Route path="about-me" element={<AboutMePage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="books/new" element={<BookFormPage />} />
          <Route path="books/:bookId" element={<BookFormPage />} />
          <Route path="mystery-book" element={<MysteryBookPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
