import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../components/FormField";
import { PasswordRequirements } from "../../components/PasswordRequirements";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useAuth } from "../../context/AuthContext";
import { AuthError } from "../../lib/authStore";
import { isLatinName, isPasswordValid, isValidEmail } from "../../lib/validation";

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

export function RegistrationPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  // Stores translation KEYS, not resolved text — so switching languages while an
  // error is showing updates it instead of leaving it frozen in the old language.
  const validate = (): FieldErrors => {
    const next: FieldErrors = {};

    if (!firstName.trim()) next.firstName = "common.required";
    else if (!isLatinName(firstName)) next.firstName = "auth.registration.errors.latinOnly";

    if (!lastName.trim()) next.lastName = "common.required";
    else if (!isLatinName(lastName)) next.lastName = "auth.registration.errors.latinOnly";

    if (!email.trim()) next.email = "common.required";
    else if (!isValidEmail(email)) next.email = "auth.registration.errors.invalidEmail";

    if (!password) next.password = "common.required";
    else if (!isPasswordValid(password)) next.password = " ";

    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      register({ firstName, lastName, email, password });
      navigate("/onboarding");
    } catch (err) {
      if (err instanceof AuthError && err.message === "email_taken") {
        setErrors((prev) => ({ ...prev, email: "auth.registration.errors.emailTaken" }));
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
        <h1 className="auth-card__title">{t("auth.registration.title")}</h1>
        <p className="auth-card__subtitle">{t("auth.registration.subtitle")}</p>

        {formError && <div className="banner banner-error">{t(formError)}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <FormField
            label={t("auth.registration.firstName")}
            name="firstName"
            autoComplete="off"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              clearError("firstName");
            }}
            error={errors.firstName ? t(errors.firstName) : undefined}
          />
          <FormField
            label={t("auth.registration.lastName")}
            name="lastName"
            autoComplete="off"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              clearError("lastName");
            }}
            error={errors.lastName ? t(errors.lastName) : undefined}
          />
          <FormField
            label={t("auth.registration.email")}
            name="email"
            type="email"
            autoComplete="off"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError("email");
            }}
            error={errors.email ? t(errors.email) : undefined}
          />
          <FormField
            label={t("auth.registration.password")}
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError("password");
            }}
            onFocus={() => setPasswordFocused(true)}
            error={errors.password?.trim() ? t(errors.password) : undefined}
            hint={passwordFocused && <PasswordRequirements password={password} />}
          />

          <button type="submit" className="btn btn-primary btn-block">
            {t("auth.registration.submit")}
          </button>
        </form>

        <p className="auth-card__footer">
          {t("auth.registration.haveAccount")}{" "}
          <Link className="btn-link" to="/login">
            {t("auth.registration.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
