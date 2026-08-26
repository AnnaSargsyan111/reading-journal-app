import { useTranslation } from "react-i18next";

interface ConfirmModalProps {
  title: string;
  body?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({ title, body, confirmLabel, onConfirm, onClose }: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <button type="button" className="modal__close" aria-label={t("common.close")} onClick={onClose}>
          ×
        </button>
        <h2>{title}</h2>
        {body && <p style={{ color: "var(--text-muted)" }}>{body}</p>}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t("common.cancel")}
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm} style={{ background: "var(--danger)" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
