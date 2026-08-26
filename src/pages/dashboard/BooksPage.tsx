import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { deleteBook, listBooks } from "../../lib/bookStore";
import { GENRES } from "../../lib/genres";
import type { Book, ReadingStatus } from "../../types/book";
import { BookCard } from "./BookCard";
import { ConfirmModal } from "../../components/ConfirmModal";
import { GenreMultiSelect } from "../../components/GenreMultiSelect";
import { CloseIcon, FilterIcon, SortIcon } from "../../components/icons";

type SortOption = "recent" | "titleAsc" | "titleDesc" | "ratingHigh" | "ratingLow";

const STATUS_VALUES: ReadingStatus[] = ["wantToRead", "currentlyReading", "read", "didNotFinish"];
const RATING_OPTIONS = [4, 3, 2, 1];
const SORT_OPTIONS: SortOption[] = ["recent", "titleAsc", "titleDesc", "ratingHigh", "ratingLow"];

export function BooksPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<Book | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReadingStatus[]>([]);
  const [genreFilter, setGenreFilter] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("recent");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen && !sortOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (filterOpen && filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
      if (sortOpen && sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [filterOpen, sortOpen]);

  if (!user) return null;

  const allBooks = listBooks(user.id);

  const toggleStatus = (status: ReadingStatus) => {
    setStatusFilter((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
  };

  const clearFilters = () => {
    setStatusFilter([]);
    setGenreFilter([]);
    setMinRating(null);
  };

  const resetAll = () => {
    setSearchTerm("");
    clearFilters();
  };

  const term = searchTerm.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!term) return [];
    const matches = allBooks.filter(
      (b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term),
    );
    return Array.from(new Set(matches.map((b) => b.title))).slice(0, 6);
  }, [allBooks, term]);

  const isSearching = term.length > 0;
  const searchWidthCh = Math.min(Math.max(searchTerm.length, t("books.searchPlaceholder").length) + 4, 48);

  const filteredBooks = useMemo(() => {
    // While actively searching, filter/sort controls are hidden (see below) — search
    // matches by title/author only, so results here should not also depend on them.
    if (isSearching) {
      return allBooks.filter(
        (book) => book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term),
      );
    }

    let result = allBooks.filter((book) => {
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(book.readingStatus);
      const matchesGenre = genreFilter.length === 0 || book.genres.some((g) => genreFilter.includes(g));
      const matchesRating = minRating === null || (book.rating ?? 0) >= minRating;
      return matchesStatus && matchesGenre && matchesRating;
    });

    result = [...result];
    switch (sortOption) {
      case "titleAsc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "titleDesc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "ratingHigh":
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "ratingLow":
        result.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
        break;
      default:
        break;
    }
    return result;
  }, [allBooks, isSearching, term, statusFilter, genreFilter, minRating, sortOption]);

  const activeFilterCount = statusFilter.length + genreFilter.length + (minRating !== null ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    deleteBook(user.id, pendingDelete.id);
    setPendingDelete(null);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div key={refreshKey}>
      <div className="page-header">
        <h1 style={{ margin: 0 }}>{t("nav.books")}</h1>
        {allBooks.length > 0 && (
          <button type="button" className="btn btn-primary" onClick={() => navigate("/dashboard/books/new")}>
            {t("dashboard.books.addCta")}
          </button>
        )}
      </div>

      {allBooks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__illustration" aria-hidden="true">
            📚
          </div>
          <h2 className="empty-state__title">{t("dashboard.books.emptyTitle")}</h2>
          <p className="empty-state__subtitle">{t("dashboard.books.emptySubtitle")}</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate("/dashboard/books/new")}>
            {t("dashboard.books.emptyCta")}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: hasActiveFilters && !isSearching ? 12 : 20 }}>
            <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
              <input
                className="form-field__input"
                style={{
                  width: `${searchWidthCh}ch`,
                  maxWidth: "100%",
                  paddingRight: isSearching ? 40 : undefined,
                  transition: "width 0.15s ease",
                }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder={t("books.searchPlaceholder")}
              />
              {isSearching && (
                <button
                  type="button"
                  aria-label={t("books.clearSearch")}
                  onClick={() => {
                    setSearchTerm("");
                    setShowSuggestions(false);
                  }}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 6,
                    display: "flex",
                  }}
                >
                  <CloseIcon width={16} height={16} />
                </button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="genre-select__panel">
                  {suggestions.map((title) => (
                    <button
                      key={title}
                      type="button"
                      className="genre-select__option"
                      style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}
                      onMouseDown={() => setSearchTerm(title)}
                    >
                      {title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!isSearching && (
            <>
            <div style={{ position: "relative" }} ref={filterRef}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFilterOpen((o) => !o)}
                aria-expanded={filterOpen}
              >
                <FilterIcon width={16} height={16} />
                {t("books.filterButton")}
                {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
              </button>

              {filterOpen && (
                <div className="genre-select__panel filter-panel">
                  <div className="form-field">
                    <span className="form-field__label">{t("books.filterStatus")}</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {STATUS_VALUES.map((status) => {
                        const selected = statusFilter.includes(status);
                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => toggleStatus(status)}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 999,
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: "pointer",
                              background: selected ? "var(--sage-100)" : "var(--surface)",
                              border: `1px solid ${selected ? "var(--forest-800)" : "var(--border)"}`,
                              color: selected ? "var(--forest-900)" : "var(--text)",
                            }}
                          >
                            {t(`books.status.${status}`)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-field">
                    <span className="form-field__label">{t("books.filterGenre")}</span>
                    <GenreMultiSelect
                      values={genreFilter}
                      onChange={setGenreFilter}
                      maxSelected={GENRES.length}
                      placeholder={t("books.genrePlaceholder")}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-field__label" htmlFor="minRating">
                      {t("books.filterRating")}
                    </label>
                    <select
                      id="minRating"
                      className="form-field__input"
                      value={minRating ?? ""}
                      onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">{t("books.anyRating")}</option>
                      {RATING_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {t("books.ratingAndUp", { count: n })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <button type="button" className="btn-link" onClick={clearFilters}>
                      {t("books.clearFilters")}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ position: "relative" }} ref={sortRef}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSortOpen((o) => !o)}
                aria-expanded={sortOpen}
              >
                <SortIcon width={16} height={16} />
                {t("books.sortLabel")}
              </button>

              {sortOpen && (
                <div className="genre-select__panel filter-panel" style={{ width: 220 }}>
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="genre-select__option"
                      style={{
                        width: "100%",
                        textAlign: "left",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: sortOption === option ? 700 : 400,
                        color: sortOption === option ? "var(--forest-800)" : "var(--text-h)",
                      }}
                      onClick={() => {
                        setSortOption(option);
                        setSortOpen(false);
                      }}
                    >
                      {t(`books.sort.${option}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            </>
            )}
          </div>

          {!isSearching && hasActiveFilters && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 20 }}>
              {statusFilter.map((status) => (
                <span className="chip-input__chip" key={status}>
                  {t(`books.status.${status}`)}
                  <button type="button" className="chip-input__remove" onClick={() => toggleStatus(status)}>
                    ×
                  </button>
                </span>
              ))}
              {genreFilter.map((genreId) => {
                const genre = GENRES.find((g) => g.id === genreId);
                if (!genre) return null;
                return (
                  <span className="chip-input__chip" key={genreId}>
                    {t(genre.labelKey)}
                    <button
                      type="button"
                      className="chip-input__remove"
                      onClick={() => setGenreFilter((prev) => prev.filter((g) => g !== genreId))}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {minRating !== null && (
                <span className="chip-input__chip">
                  {t("books.ratingAndUp", { count: minRating })}
                  <button type="button" className="chip-input__remove" onClick={() => setMinRating(null)}>
                    ×
                  </button>
                </span>
              )}
              <button type="button" className="btn-link" onClick={clearFilters}>
                {t("books.clearFilters")}
              </button>
            </div>
          )}

          {filteredBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__illustration" aria-hidden="true">
                🔍
              </div>
              <h2 className="empty-state__title">{t("books.noResultsTitle")}</h2>
              <p className="empty-state__subtitle">{t("books.noResultsSubtitle")}</p>
              <button type="button" className="btn btn-secondary" onClick={resetAll}>
                {t("books.resetSearch")}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 20,
              }}
            >
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} onDelete={setPendingDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {pendingDelete && (
        <ConfirmModal
          title={t("books.deleteConfirmTitle", { title: pendingDelete.title })}
          body={t("books.deleteConfirmBody")}
          confirmLabel={t("books.delete")}
          onConfirm={handleConfirmDelete}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
