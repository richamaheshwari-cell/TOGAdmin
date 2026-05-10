"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { BONUS_ICON_KEYS } from "@/lib/constants";
import { BONUS_ICON_MAP } from "./bonusIconsMap";

const iconKeysList = BONUS_ICON_KEYS.filter((key) => key in BONUS_ICON_MAP);

function SafeIcon({ iconKey }: { iconKey: string }) {
  const IconComponent = BONUS_ICON_MAP[iconKey];
  if (!IconComponent) return null;
  return <IconComponent fontSize="medium" />;
}

export interface IconPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (iconKey: string) => void;
  selectedIconKey?: string;
}

export function IconPicker({ open, onClose, onSelect, selectedIconKey }: IconPickerProps) {
  const theme = useTheme();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return iconKeysList;
    return iconKeysList.filter((key) => key.toLowerCase().includes(q));
  }, [search]);

  const handleSelect = (key: string) => {
    onSelect(key);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Choose icon</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Search icons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2, mt: 0.5 }}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
            gap: 0.5,
            maxHeight: theme.spacing(40),
            overflow: "auto",
          }}
        >
          {filtered.map((key) => (
            <IconButton
              key={key}
              size="small"
              onClick={() => handleSelect(key)}
              sx={{
                border: 1,
                borderColor: selectedIconKey === key ? "primary.main" : "divider",
                bgcolor: selectedIconKey === key ? "primary.light" : "transparent",
                color: selectedIconKey === key ? "primary.main" : "text.primary",
                "&:hover": {
                  bgcolor: selectedIconKey === key ? "primary.light" : "action.hover",
                },
              }}
              title={key}
            >
              <SafeIcon iconKey={key} />
            </IconButton>
          ))}
        </Box>
        {filtered.length === 0 && (
          <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
            No icons match &quot;{search}&quot;
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
