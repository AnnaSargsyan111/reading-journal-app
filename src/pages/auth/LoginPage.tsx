import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../components/FormField";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useAuth } from "../../context/AuthContext";
import { AuthError } from "../../lib/authStore";
import { isValidEmail } from "../../lib/validation";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  // Stores translation KEYS, not resolved text — so switching languages while an
  // error is showing updates it instead of leaving it frozen in the old language.
  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!email.trim()) next.email = "common.required";
    else if (!isValidEmail(email)) next.email = "auth.login.errors.invalidEmail";

    if (!password) next.password = "common.required";

    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const user = login(email, password);
      navigate(user.onboardingCompleted ? "/dashboard/books" : "/onboarding");
    } catch (err) {
      if (err instanceof AuthError && err.message === "invalid_credentials") {
        setFormError("auth.login.errors.incorrectCredentials");
      } else {
        setFormError("common.genericError");
      }
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="page-header" style={{ marginBottom: 8 }}>
          <div />
          <LanguageSwitcher />
        </div>
        <h1 className="auth-card__title">{t("auth.login.title")}</h1>
        <p className="auth-card__subtitle">{t("auth.login.subtitle")}</p>

        {formError && <div className="banner banner-error">{t(formError)}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label={t("auth.login.email")}
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            error={errors.email ? t(errors.email) : undefined}
          />
          <FormField
            label={t("auth.login.password")}
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError("password");
            }}
            error={errors.password ? t(errors.password) : undefined}
          />

          <div style={{ textAlign: "right", marginTop: -8 }}>
            <Link className="btn-link" to="/forgot-password">
              {t("auth.login.forgotPassword")}
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            {t("auth.login.submit")}
          </button>
        </form>

        <p className="auth-card__footer">
          {t("auth.login.noAccount")}{" "}
          <Link className="btn-link" to="/register">
            {t("auth.login.register")}
          </Link>
        </p>
      </div>
    </div>
  );
}
