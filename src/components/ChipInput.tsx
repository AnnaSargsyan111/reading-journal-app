import { useState, type KeyboardEvent } from "react";

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  tone?: "forest" | "plum";
}

export function ChipInput({ values, onChange, placeholder, tone = "forest" }: ChipInputProps) {
  const [draft, setDraft] = useState("");

  const addChip = () => {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addChip();
    } else if (event.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  const removeChip = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="chip-input">
      {values.map((value, index) => (
        <span className={`chip-input__chip chip-input__chip--${tone}`} key={`${value}-${index}`}>
          {value}
          <button
            type="button"
            className="chip-input__remove"
            onClick={() => removeChip(index)}
            aria-label={`Remove ${value}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        className="chip-input__field"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addChip}
        placeholder={values.length === 0 ? placeholder : ""}
      />
    </div>
  );
}
