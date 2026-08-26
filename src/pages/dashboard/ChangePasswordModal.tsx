import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { PasswordRequirements } from "../../components/PasswordRequirements";
import { FormField } from "../../components/FormField";
import { isPasswordValid } from "../../lib/validation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { AuthError, changePassword } from "../../lib/authStore";

interface ChangePasswordModalProps {
  onClose: () => void;
}

interface FieldErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { t } = useTranslation();
  const { user, refresh } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [focused, setFocused] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    // Stores translation KEYS, not resolved text — so switching languages while an
    // error is showing updates it instead of leaving it frozen in the old language.
    const nextErrors: FieldErrors = {};
    if (!currentPassword) nextErrors.currentPassword = "common.required";
    if (!newPassword) nextErrors.newPassword = "common.required";
    else if (!isPasswordValid(newPassword)) nextErrors.newPassword = " ";
    if (!confirmPassword) nextErrors.confirmPassword = "common.required";
    else if (!nextErrors.newPassword && confirmPassword !== newPassword) {
      nextErrors.confirmPassword = "auth.resetPassword.errors.mismatch";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      changePassword(user.id, currentPassword, newPassword);
      refresh();
      setErrors({});
      showToast(t("about.password.changeSuccess"));
      onClose();
    } catch (err) {
      if (err instanceof AuthError) setErrors({ currentPassword: "auth.login.errors.incorrectCredentials" });
      else throw err;
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal" style={{ textAlign: "left" }}>
        <button type="button" className="modal__close" aria-label={t("common.close")} onClick={onClose}>
          ×
        </button>
        <h2>{t("about.password.changeTitle")}</h2>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormField
            label={t("about.password.current")}
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              clearError("currentPassword");
            }}
            error={errors.currentPassword ? t(errors.currentPassword) : undefined}
          />
          <FormField
            label={t("auth.resetPassword.newPassword")}
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              clearError("newPassword");
            }}
            onFocus={() => setFocused(true)}
            error={errors.newPassword?.trim() ? t(errors.newPassword) : undefined}
            hint={focused && <PasswordRequirements password={newPassword} />}
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
            {t("common.save")}
          </button>
        </form>
      </div>
    </div>
  );
}
