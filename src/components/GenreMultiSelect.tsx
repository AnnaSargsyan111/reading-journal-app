import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { GENRES, MAX_ONBOARDING_GENRES } from "../lib/genres";

interface GenreMultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  maxSelected?: number;
  placeholder?: string;
}

export function GenreMultiSelect({
  values,
  onChange,
  maxSelected = MAX_ONBOARDING_GENRES,
  placeholder,
}: GenreMultiSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [limitError, setLimitError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const toggleGenre = (id: string) => {
    if (values.includes(id)) {
      onChange(values.filter((v) => v !== id));
      setLimitError(false);
      return;
    }
    if (values.length >= maxSelected) {
      setLimitError(true);
      return;
    }
    setLimitError(false);
    onChange([...values, id]);
  };

  return (
    <div className="genre-select" ref={containerRef}>
      <button
        type="button"
        className="genre-select__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {values.length > 0
          ? t("onboarding.genre.selected", { count: values.length })
          : (placeholder ?? t("onboarding.genre.placeholder"))}
        <span className="genre-select__chevron" aria-hidden="true">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="genre-select__panel">
          {GENRES.map((genre) => (
            <label className="genre-select__option" key={genre.id}>
              <input
                type="checkbox"
                checked={values.includes(genre.id)}
                onChange={() => toggleGenre(genre.id)}
              />
              {t(genre.labelKey)}
            </label>
          ))}
        </div>
      )}

      {limitError && <p className="form-field__error">{t("onboarding.genre.tooMany")}</p>}

      {values.length > 0 && (
        <div className="genre-select__chips">
          {values.map((id) => {
            const genre = GENRES.find((g) => g.id === id);
            if (!genre) return null;
            return (
              <span className="chip-input__chip" key={id}>
                {t(genre.labelKey)}
                <button
                  type="button"
                  className="chip-input__remove"
                  onClick={() => toggleGenre(id)}
                  aria-label={`Remove ${t(genre.labelKey)}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
