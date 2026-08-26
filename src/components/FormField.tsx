import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
}

export function FormField({ label, error, hint, id, ...inputProps }: FormFieldProps) {
  const fieldId = id ?? inputProps.name;
  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        className={`form-field__input${error ? " form-field__input--error" : ""}`}
        aria-invalid={Boolean(error)}
        {...inputProps}
      />
      {hint}
      {error && <p className="form-field__error">{error}</p>}
    </div>
  );
}
