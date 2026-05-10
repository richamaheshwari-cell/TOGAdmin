"use client";

import { useRef, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { api } from "@/lib/api";

const ACCEPT = "image/jpeg,image/png,image/gif,image/webp";
const MAX_MB = 5;

export interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  /** e.g. "Logo", "Favicon" for preview alt */
  previewAlt?: string;
  /** If true, hide the URL text field (only upload/drop). */
  hideUrlField?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  label = "Image",
  helperText,
  previewAlt = "Preview",
  hideUrlField = false,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setError("");
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      setError("Please use JPEG, PNG, GIF or WebP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Max size ${MAX_MB}MB.`);
      return;
    }
    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  return (
    <Box>
      <Box
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        sx={{
          border: "2px dashed",
          borderColor: dragOver ? "primary.main" : "divider",
          borderRadius: 2,
          p: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          bgcolor: dragOver ? "action.hover" : "transparent",
        }}
      >
        {value ? (
          <Box
            component="img"
            src={value}
            alt={previewAlt}
            sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
          />
        ) : null}
        <Box sx={{ flex: 1, minWidth: 120 }}>
          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading…" : "Upload image"}
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }} color="text.secondary">
            or drag and drop (JPEG/PNG/GIF/WebP, max {MAX_MB}MB)
          </Typography>
        </Box>
      </Box>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {error ? <Typography color="error" variant="body2" sx={{ mt: 0.5 }}>{error}</Typography> : null}
      {!hideUrlField && (
        <TextField
          fullWidth
          size="small"
          label={value ? "Image URL" : label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          helperText={helperText}
          sx={{ mt: 1.5 }}
        />
      )}
    </Box>
  );
}
