import type { MouseEvent } from "react";

interface StarRatingProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

const STAR_POSITIONS = [1, 2, 3, 4, 5];

export function StarRating({ value = 0, onChange, disabled }: StarRatingProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>, position: number) => {
    if (disabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickedLeftHalf = event.clientX - rect.left < rect.width / 2;
    onChange(clickedLeftHalf ? position - 0.5 : position);
  };

  return (
    <div
      style={{ display: "inline-flex", gap: 2, opacity: disabled ? 0.4 : 1 }}
      aria-disabled={disabled}
    >
      {STAR_POSITIONS.map((position) => {
        const fill = Math.max(0, Math.min(1, value - (position - 1)));
        return (
          <button
            key={position}
            type="button"
            disabled={disabled}
            onClick={(e) => handleClick(e, position)}
            style={{
              background: "none",
              border: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              padding: 0,
              position: "relative",
              width: 26,
              height: 26,
              fontSize: 24,
              lineHeight: "26px",
            }}
            aria-label={`${position} star`}
          >
            <span style={{ position: "absolute", inset: 0, color: "var(--border)" }}>★</span>
            <span
              style={{
                position: "absolute",
                inset: 0,
                color: "var(--accent)",
                overflow: "hidden",
                width: `${fill * 100}%`,
              }}
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
}
