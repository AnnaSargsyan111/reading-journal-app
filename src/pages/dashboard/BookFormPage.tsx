import { useState, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { ChipInput } from "../../components/ChipInput";
import { GenreMultiSelect } from "../../components/GenreMultiSelect";
import { StarRating } from "../../components/StarRating";
import { ConfirmModal } from "../../components/ConfirmModal";
import { useAuth } from "../../context/AuthContext";
import { createBook, deleteBook, getBook, updateBook } from "../../lib/bookStore";
import { GENRES } from "../../lib/genres";
import type { Quote, ReadingStatus } from "../../types/book";

const STATUS_VALUES: ReadingStatus[] = ["wantToRead", "currentlyReading", "read", "didNotFinish"];

export function BookFormPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookId } = useParams();
  const isEditing = Boolean(bookId);
  const existing = isEditing && user ? getBook(user.id, bookId!) : undefined;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [author, setAuthor] = useState(existing?.author ?? "");
  const [readingStatus, setReadingStatus] = useState<ReadingStatus | "">(existing?.readingStatus ?? "");
  const [rating, setRating] = useState<number | undefined>(existing?.rating);
  const [genres, setGenres] = useState<string[]>(existing?.genres ?? []);
  const [plotNotes, setPlotNotes] = useState(existing?.plotNotes ?? "");
  const [characters, setCharacters] = useState<string[]>(existing?.characters ?? []);
  const [quotes, setQuotes] = useState<Quote[]>(existing?.quotes ?? []);
  const [commentary, setCommentary] = useState(existing?.commentary ?? "");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>(existing?.photoDataUrl);
  const [errors, setErrors] = useState<{ title?: string; author?: string; readingStatus?: string; rating?: string }>(
    {},
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!user) return null;

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addQuote = () => {
    setQuotes((prev) => [...prev, { id: crypto.randomUUID(), text: "", page: "" }]);
  };

  const updateQuote = (id: string, patch: Partial<Quote>) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const removeQuote = (id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  // Stores translation KEYS, not resolved text — so switching languages while an
  // error is showing updates it instead of leaving it frozen in the old language.
  const handleSave = () => {
    const nextErrors: typeof errors = {};
    if (!title.trim()) nextErrors.title = "books.errors.titleRequired";
    if (!author.trim()) nextErrors.author = "books.errors.authorRequired";
    if (!readingStatus) nextErrors.readingStatus = "books.errors.statusRequired";
    if (readingStatus === "read" && !rating) nextErrors.rating = "books.errors.ratingRequired";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const input = {
      title: title.trim(),
      author: author.trim(),
      readingStatus: readingStatus as ReadingStatus,
      rating: readingStatus === "read" ? rating : undefined,
      genres,
      plotNotes,
      characters,
      quotes: quotes.filter((q) => q.text.trim()),
      commentary,
      photoDataUrl,
    };

    if (isEditing && existing) {
      updateBook(user.id, existing.id, input);
    } else {
      createBook(user.id, input);
    }
    navigate("/dashboard/books");
  };

  const handleDelete = () => {
    if (!existing) return;
    deleteBook(user.id, existing.id);
    navigate("/dashboard/books");
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ margin: 0 }}>{isEditing ? t("books.editTitle") : t("books.addTitle")}</h1>
      </div>

      <div className="auth-form" style={{ maxWidth: 560 }}>
        <div className="form-field">
          <label className="form-field__label" htmlFor="title">
            {t("books.title")}
          </label>
          <input
            id="title"
            className={errors.title ? "form-field__input form-field__input--error" : "form-field__input"}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
          />
          {errors.title && <p className="form-field__error">{t(errors.title)}</p>}
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="author">
            {t("books.author")}
          </label>
          <input
            id="author"
            className={errors.author ? "form-field__input form-field__input--error" : "form-field__input"}
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
              if (errors.author) setErrors((prev) => ({ ...prev, author: undefined }));
            }}
          />
          {errors.author && <p className="form-field__error">{t(errors.author)}</p>}
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="readingStatus">
            {t("books.readingStatus")}
          </label>
          <select
            id="readingStatus"
            className={
              errors.readingStatus ? "form-field__input form-field__input--error" : "form-field__input"
            }
            value={readingStatus}
            onChange={(e) => {
              const next = e.target.value as ReadingStatus;
              setReadingStatus(next);
              if (next !== "read") setRating(undefined);
              if (errors.readingStatus) setErrors((prev) => ({ ...prev, readingStatus: undefined }));
            }}
          >
            <option value="" disabled>
              {t("books.readingStatusPlaceholder")}
            </option>
            {STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {t(`books.status.${status}`)}
              </option>
            ))}
          </select>
          {errors.readingStatus && <p className="form-field__error">{t(errors.readingStatus)}</p>}
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("books.rating")}</span>
          <StarRating
            value={rating}
            onChange={(v) => {
              setRating(v);
              if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
            }}
            disabled={readingStatus !== "read"}
          />
          {readingStatus !== "read" && (
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              {t("books.ratingHint")}
            </p>
          )}
          {errors.rating && <p className="form-field__error">{t(errors.rating)}</p>}
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("books.genre")}</span>
          <GenreMultiSelect
            values={genres}
            onChange={setGenres}
            maxSelected={GENRES.length}
            placeholder={t("books.genrePlaceholder")}
          />
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="plotNotes">
            {t("books.plotNotes")}
          </label>
          <textarea
            id="plotNotes"
            className="form-field__textarea"
            value={plotNotes}
            onChange={(e) => setPlotNotes(e.target.value)}
          />
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("books.aiSummary")}</span>
          <button type="button" className="btn btn-secondary" disabled title={t("books.aiSummaryUpsell")}>
            {t("books.aiSummary")}
          </button>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{t("books.aiSummaryUpsell")}</p>
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("books.characters")}</span>
          <ChipInput values={characters} onChange={setCharacters} placeholder={t("books.charactersPlaceholder")} />
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("books.quotes")}</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {quotes.map((quote) => (
              <div key={quote.id} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12 }}>
                <textarea
                  className="form-field__textarea"
                  style={{ minHeight: 60 }}
                  placeholder={t("books.quoteText")}
                  value={quote.text}
                  onChange={(e) => updateQuote(quote.id, { text: e.target.value })}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                  <input
                    className="form-field__input"
                    style={{ maxWidth: 120 }}
                    placeholder={t("books.quotePage")}
                    value={quote.page ?? ""}
                    onChange={(e) => updateQuote(quote.id, { page: e.target.value })}
                  />
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => removeQuote(quote.id)}
                  >
                    {t("books.removeQuote")}
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary" onClick={addQuote} style={{ alignSelf: "flex-start" }}>
              {t("books.addQuote")}
            </button>
          </div>
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="commentary">
            {t("books.commentary")}
          </label>
          <textarea
            id="commentary"
            className="form-field__textarea"
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
          />
        </div>

        <div className="form-field">
          <span className="form-field__label">{t("books.photo")}</span>
          {photoDataUrl ? (
            <div>
              <img
                src={photoDataUrl}
                alt=""
                style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 10, marginBottom: 8 }}
              />
              <div>
                <button type="button" className="btn-link" onClick={() => setPhotoDataUrl(undefined)}>
                  {t("books.removePhoto")}
                </button>
              </div>
            </div>
          ) : (
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          )}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            {t("books.save")}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard/books")}>
            {t("books.cancel")}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ color: "var(--danger)", marginLeft: "auto" }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              {t("books.delete")}
            </button>
          )}
        </div>
      </div>

      {showDeleteConfirm && existing && (
        <ConfirmModal
          title={t("books.deleteConfirmTitle", { title: existing.title })}
          body={t("books.deleteConfirmBody")}
          confirmLabel={t("books.delete")}
          onConfirm={handleDelete}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
