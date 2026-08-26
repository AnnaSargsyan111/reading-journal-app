import { useTranslation } from "react-i18next";

interface WelcomeModalProps {
  onClose: () => void;
  onAddBook: () => void;
}

export function WelcomeModal({ onClose, onAddBook }: WelcomeModalProps) {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <button type="button" className="modal__close" aria-label={t("common.close")} onClick={onClose}>
          ×
        </button>
        <h2>{t("welcomeModal.title")}</h2>
        <button type="button" className="btn btn-primary" onClick={onAddBook} style={{ marginTop: 16 }}>
          {t("welcomeModal.cta")}
        </button>
      </div>
    </div>
  );
}
