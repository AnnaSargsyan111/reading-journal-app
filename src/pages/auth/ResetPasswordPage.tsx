import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { FormField } from "../../components/FormField";
import { PasswordRequirements } from "../../components/PasswordRequirements";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useAuth } from "../../context/AuthContext";
import { AuthError } from "../../lib/authStore";
import { isPasswordValid } from "../../lib/validation";

interface FieldErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  // Stores translation KEYS, not resolved text — so switching languages while an
  // error is showing updates it instead of leaving it frozen in the old language.
  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!newPassword) next.newPassword = "common.required";
    else if (!isPasswordValid(newPassword)) next.newPassword = " ";

    if (!confirmPassword) next.confirmPassword = "common.required";
    else if (confirmPassword !== newPassword) next.confirmPassword = "auth.resetPassword.errors.mismatch";

    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err) {
      if (err instanceof AuthError) setInvalidLink(true);
      else throw err;
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="page-header" style={{ marginBottom: 8 }}>
          <div />
          <LanguageSwitcher />
        </div>

        {!token || invalidLink ? (
          <div className="banner banner-error">{t("auth.resetPassword.invalidLink")}</div>
        ) : success ? (
          <div className="banner banner-success">{t("auth.resetPassword.success")}</div>
        ) : (
          <>
            <h1 className="auth-card__title">{t("auth.resetPassword.title")}</h1>
            <p className="auth-card__subtitle">{t("auth.resetPassword.subtitle")}</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <FormField
                label={t("auth.resetPassword.newPassword")}
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  clearError("newPassword");
                }}
                onFocus={() => setPasswordFocused(true)}
                error={errors.newPassword?.trim() ? t(errors.newPassword) : undefined}
                hint={passwordFocused && <PasswordRequirements password={newPassword} />}
              />
              <FormField
                label={t("auth.resetPassword.confirmPassword")}
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearError("confirmPassword");
                }}
                error={errors.confirmPassword ? t(errors.confirmPassword) : undefined}
              />
              <button type="submit" className="btn btn-primary btn-block">
                {t("auth.resetPassword.submit")}
              </button>
            </form>
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
