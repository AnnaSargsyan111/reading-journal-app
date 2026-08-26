import { useTranslation } from "react-i18next";

interface WelcomeModalProps {
  onDismiss: () => void;
}

export function WelcomeModal({ onDismiss }: WelcomeModalProps) {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <button type="button" className="modal__close" aria-label={t("common.close")} onClick={onDismiss}>
          ×
        </button>
        <h2>{t("welcomeModal.title")}</h2>
        <button type="button" className="btn btn-primary" onClick={onDismiss} style={{ marginTop: 16 }}>
          {t("welcomeModal.cta")}
        </button>
      </div>
    </div>
  );
}
