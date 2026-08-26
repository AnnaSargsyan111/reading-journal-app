import { useTranslation } from "react-i18next";
import { checkPassword } from "../lib/validation";

export function PasswordRequirements({ password }: { password: string }) {
  const { t } = useTranslation();
  const check = checkPassword(password);

  const items: Array<{ key: keyof typeof check; label: string }> = [
    { key: "minLength", label: t("auth.password.minLength") },
    { key: "maxLength", label: t("auth.password.maxLength") },
    { key: "hasUppercase", label: t("auth.password.hasUppercase") },
    { key: "hasNumber", label: t("auth.password.hasNumber") },
    { key: "hasSpecialChar", label: t("auth.password.hasSpecialChar") },
  ];

  return (
    <div className="password-requirements">
      <p className="password-requirements__title">{t("auth.password.requirementsTitle")}</p>
      <ul>
        {items.map((item) => (
          <li
            key={item.key}
            className={check[item.key] ? "password-requirements__item--met" : "password-requirements__item"}
          >
            <span aria-hidden="true">{check[item.key] ? "✓" : "•"}</span> {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
