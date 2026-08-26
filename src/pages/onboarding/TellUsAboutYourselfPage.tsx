import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChipInput } from "../../components/ChipInput";
import { GenreMultiSelect } from "../../components/GenreMultiSelect";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { WelcomeModal } from "./WelcomeModal";

export function TellUsAboutYourselfPage() {
  const { t } = useTranslation();
  const { user, completeOnboarding, markWelcomeSeen } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [genres, setGenres] = useState<string[]>([]);
  const [favoriteAuthors, setFavoriteAuthors] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState("");
  const [aboutMeError, setAboutMeError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);

  if (!user) return null;

  const handleContinue = () => {
    if (!aboutMe.trim()) {
      setAboutMeError("common.required");
      return;
    }
    setAboutMeError("");
    completeOnboarding({ genres, favoriteAuthors, aboutMe });
    showToast(t("onboarding.savedToast"));
    setShowWelcome(true);
  };

  const handleDismissWelcome = () => {
    markWelcomeSeen();
    navigate("/dashboard/books");
  };

  return (
    <div className="auth-shell">
      <div className="auth-card auth-card--wide">
        <div className="page-header" style={{ marginBottom: 8 }}>
          <div />
          <LanguageSwitcher />
        </div>
        <h1 className="auth-card__title">{t("onboarding.title")}</h1>
        <p className="auth-card__subtitle">{t("onboarding.subtitle")}</p>

        <div className="auth-form">
          <div className="form-field">
            <span className="form-field__label">{t("onboarding.nameLabel")}</span>
            <div className="form-field__readonly">
              {user.firstName} {user.lastName}
            </div>
          </div>

          <div className="form-field">
            <span className="form-field__label">{t("onboarding.genre.label")}</span>
            <GenreMultiSelect values={genres} onChange={setGenres} />
          </div>

          <div className="form-field">
            <span className="form-field__label">{t("onboarding.favoriteAuthors.label")}</span>
            <ChipInput
              values={favoriteAuthors}
              onChange={setFavoriteAuthors}
              placeholder={t("onboarding.favoriteAuthors.placeholder")}
            />
          </div>

          <div className="form-field">
            <label className="form-field__label" htmlFor="aboutMe">
              {t("onboarding.aboutMe.label")}
            </label>
            <textarea
              id="aboutMe"
              className={
                aboutMeError ? "form-field__textarea form-field__input--error" : "form-field__textarea"
              }
              value={aboutMe}
              onChange={(e) => {
                setAboutMe(e.target.value);
                if (aboutMeError) setAboutMeError("");
              }}
              placeholder={t("onboarding.aboutMe.placeholder")}
            />
            {aboutMeError && <p className="form-field__error">{t(aboutMeError)}</p>}
          </div>

          <button type="button" className="btn btn-primary btn-block" onClick={handleContinue}>
            {t("onboarding.continue")}
          </button>
        </div>
      </div>

      {showWelcome && <WelcomeModal onDismiss={handleDismissWelcome} />}
    </div>
  );
}
