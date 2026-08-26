import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="lang-switch">
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          className={
            i18n.resolvedLanguage === lng ? "lang-switch__option lang-switch__option--active" : "lang-switch__option"
          }
          onClick={() => void i18n.changeLanguage(lng)}
        >
          {lng === "hy" ? "ՀԱՅ" : "EN"}
        </button>
      ))}
    </div>
  );
}
