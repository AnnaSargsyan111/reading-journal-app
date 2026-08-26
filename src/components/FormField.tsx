import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { EyeIcon, EyeOffIcon } from "./icons";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function FormField({ label, error, hint, id, type, ...inputProps }: FormFieldProps) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const fieldId = id ?? inputProps.name;
  const isPassword = type === "password";

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <div style={isPassword ? { position: "relative" } : undefined}>
        <input
          id={fieldId}
          type={isPassword && showPassword ? "text" : type}
          className={`form-field__input${error ? " form-field__input--error" : ""}`}
          style={isPassword ? { paddingRight: 40 } : undefined}
          aria-invalid={Boolean(error)}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={t(showPassword ? "common.hidePassword" : "common.showPassword")}
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 6,
              display: "flex",
            }}
          >
            {showPassword ? <EyeOffIcon width={18} height={18} /> : <EyeIcon width={18} height={18} />}
          </button>
        )}
      </div>
      {hint}
      {error && <p className="form-field__error">{error}</p>}
    </div>
  );
}
