"use client";

import { Box, Chip, TextField } from "@mui/material";
import { useCallback, useState, KeyboardEvent } from "react";

interface ChipsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  "data-testid"?: string;
}

export function ChipsInput({
  value,
  onChange,
  label,
  placeholder = "Add item and press Enter",
  disabled,
}: ChipsInputProps) {
  const [input, setInput] = useState("");

  const add = useCallback(() => {
    const raw = input.trim();
    if (!raw) {
      setInput("");
      return;
    }
    // Support comma-separated: "a, b, c" → multiple chips
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const next = [...value];
    parts.forEach((p) => {
      if (!next.includes(p)) next.push(p);
    });
    onChange(next);
    setInput("");
  }, [input, value, onChange]);

  const remove = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        label={label}
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={add}
        disabled={disabled}
        InputProps={{}}
      />
      {value.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
          {value.map((item, i) => (
            <Chip
              key={`${item}-${i}`}
              label={item}
              size="small"
              onDelete={() => remove(i)}
              disabled={disabled}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
