import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { Book, ReadingStatus } from "../../types/book";

interface BookCardProps {
  book: Book;
  onDelete: (book: Book) => void;
}

const STATUS_COLORS: Record<ReadingStatus, { color: string; bg: string }> = {
  read: { color: "var(--success)", bg: "var(--success-bg)" },
  wantToRead: { color: "var(--warning)", bg: "var(--warning-bg)" },
  currentlyReading: { color: "var(--plum-700)", bg: "var(--plum-100)" },
  didNotFinish: { color: "var(--gray-400)", bg: "var(--ivory-100)" },
};

export function BookCard({ book, onDelete }: BookCardProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--surface)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={() => navigate(`/dashboard/books/${book.id}`)}
    >
      <div
        style={{
          height: 160,
          background: book.photoDataUrl ? undefined : "var(--accent-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {book.photoDataUrl ? (
          <img src={book.photoDataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ textAlign: "center", padding: 12 }}>
            <div style={{ fontWeight: 700, color: "var(--accent)" }}>{book.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{book.author}</div>
          </div>
        )}
      </div>

      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div style={{ fontWeight: 600, color: "var(--text-h)" }}>{book.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{book.author}</div>
          </div>
          <button
            type="button"
            aria-label={t("books.delete")}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(book);
            }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 16 }}
          >
            ×
          </button>
        </div>

        <span
          style={{
            alignSelf: "flex-start",
            fontSize: 12,
            fontWeight: 600,
            color: STATUS_COLORS[book.readingStatus].color,
            background: STATUS_COLORS[book.readingStatus].bg,
            borderRadius: 999,
            padding: "3px 10px",
          }}
        >
          {t(`books.status.${book.readingStatus}`)}
        </span>

        {book.readingStatus === "read" && book.rating && (
          <div style={{ color: "var(--success)", fontSize: 14 }}>{"★".repeat(Math.round(book.rating))}</div>
        )}
      </div>
    </div>
  );
}
