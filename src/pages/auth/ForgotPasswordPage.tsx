import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../components/FormField";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail } from "../../lib/validation";

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("common.required");
      return;
    }
    if (!isValidEmail(email)) {
      setError("auth.forgotPassword.errors.invalidEmail");
      return;
    }
    setError("");

    const result = requestPasswordReset(email);
    setDevToken(result?.token);
    setSent(true);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="page-header" style={{ marginBottom: 8 }}>
          <div />
          <LanguageSwitcher />
        </div>

        {!sent ? (
          <>
            <h1 className="auth-card__title">{t("auth.forgotPassword.title")}</h1>
            <p className="auth-card__subtitle">{t("auth.forgotPassword.subtitle")}</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <FormField
                label={t("auth.forgotPassword.email")}
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                error={error ? t(error) : undefined}
              />
              <button type="submit" className="btn btn-primary btn-block">
                {t("auth.forgotPassword.submit")}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-card__title">{t("auth.forgotPassword.sentTitle")}</h1>
            <p className="auth-card__subtitle">{t("auth.forgotPassword.sentSubtitle")}</p>

            {devToken && (
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => navigate(`/reset-password?token=${devToken}`)}
              >
                {t("auth.forgotPassword.devContinue")}
              </button>
            )}
          </>
        )}

        <p className="auth-card__footer">
          <Link className="btn-link" to="/login">
            {t("common.backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
