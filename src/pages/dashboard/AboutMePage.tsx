import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChipInput } from "../../components/ChipInput";
import { GenreMultiSelect } from "../../components/GenreMultiSelect";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { updateProfile } from "../../lib/authStore";
import { isLatinName } from "../../lib/validation";
import { ChangePasswordModal } from "./ChangePasswordModal";

export function AboutMePage() {
  const { t } = useTranslation();
  const { user, refresh } = useAuth();
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [genres, setGenres] = useState<string[]>(user?.genres ?? []);
  const [favoriteAuthors, setFavoriteAuthors] = useState<string[]>(user?.favoriteAuthors ?? []);
  const [aboutMe, setAboutMe] = useState(user?.aboutMe ?? "");
  const [nameError, setNameError] = useState("");
  const [surnameError, setSurnameError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (!user) return null;

  // Stores translation KEYS, not resolved text — so switching languages while an
  // error is showing updates it instead of leaving it frozen in the old language.
  const handleSave = () => {
    let hasError = false;
    if (!firstName.trim() || !isLatinName(firstName)) {
      setNameError(!firstName.trim() ? "about.cannotBeEmpty" : "auth.registration.errors.latinOnly");
      hasError = true;
    } else {
      setNameError("");
    }
    if (!lastName.trim() || !isLatinName(lastName)) {
      setSurnameError(!lastName.trim() ? "about.cannotBeEmpty" : "auth.registration.errors.latinOnly");
      hasError = true;
    } else {
      setSurnameError("");
    }
    if (hasError) return;

    updateProfile(user.id, { firstName, lastName, genres, favoriteAuthors, aboutMe });
    refresh();
    showToast(t("about.saved"));
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ margin: 0 }}>{t("about.title")}</h1>
      </div>

      <div className="auth-form" style={{ maxWidth: 480 }}>
        <div className="form-field">
          <label className="form-field__label" htmlFor="firstName">
            {t("about.name")}
          </label>
          <input
            id="firstName"
            className={nameError ? "form-field__input form-field__input--error" : "form-field__input"}
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (nameError) setNameError("");
            }}
          />
          {nameError && <p className="form-field__error">{t(nameError)}</p>}
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="lastName">
            {t("about.surname")}
          </label>
          <input
            id="lastName"
            className={surnameError ? "form-field__input form-field__input--error" : "form-field__input"}
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              if (surnameError) setSurnameError("");
            }}
          />
          {surnameError && <p className="form-field__error">{t(surnameError)}</p>}
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("about.email")}</span>
          <div className="form-field__readonly">{user.email}</div>
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("about.genre")}</span>
          <GenreMultiSelect values={genres} onChange={setGenres} maxSelected={5} />
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("about.favoriteAuthors")}</span>
          <ChipInput values={favoriteAuthors} onChange={setFavoriteAuthors} tone="plum" />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="aboutMeText">
            {t("about.aboutMeText")}
          </label>
          <textarea
            id="aboutMeText"
            className="form-field__textarea"
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            {t("about.save")}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(true)}>
            {t("about.changePassword")}
          </button>
        </div>
      </div>

      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
    </div>
  );
}
