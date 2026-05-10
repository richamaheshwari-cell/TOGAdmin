"use client";

import { Box, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { EditorCard } from "./EditorCard";

/** Standard SEO character limits: title 50–66 chars, description ~160 for search snippets. */
const SEO_TITLE_MAX = 66;
const SEO_DESC_MAX = 160;

export interface SeoFieldsCardProps {
  seoTitle: string;
  seoDesc: string;
  onSeoTitleChange: (v: string) => void;
  onSeoDescChange: (v: string) => void;
  /** Optional. When omitted or null, Focus Keywords row is hidden (e.g. casino uses tags as focus). */
  focusKeywordsNode?: React.ReactNode | null;
  seoTitleError?: string;
  seoDescError?: string;
  /** Override defaults (title 66, desc 160) only if a content type needs different limits. */
  seoTitleMax?: number;
  seoDescMax?: number;
}

export function SeoFieldsCard({
  seoTitle,
  seoDesc,
  onSeoTitleChange,
  onSeoDescChange,
  focusKeywordsNode,
  seoTitleError,
  seoDescError,
  seoTitleMax = SEO_TITLE_MAX,
  seoDescMax = SEO_DESC_MAX,
}: SeoFieldsCardProps) {
  return (
    <EditorCard title="SEO Settings" icon={<SearchIcon fontSize="small" color="action" />}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box>
          <TextField
            fullWidth
            size="small"
            label="SEO Title"
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            placeholder="SEO optimized title"
            error={!!seoTitleError}
            helperText={seoTitleError ?? `${seoTitle.length}/${seoTitleMax} characters`}
            inputProps={{ maxLength: seoTitleMax }}
          />
        </Box>
        <Box>
          <TextField
            fullWidth
            size="small"
            label="SEO Description"
            value={seoDesc}
            onChange={(e) => onSeoDescChange(e.target.value)}
            placeholder="Meta description for search engines"
            multiline
            rows={2}
            error={!!seoDescError}
            helperText={seoDescError ?? `${seoDesc.length}/${seoDescMax} characters`}
            inputProps={{ maxLength: seoDescMax }}
          />
        </Box>
        {focusKeywordsNode != null && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Focus Keywords
            </Typography>
            {focusKeywordsNode}
          </Box>
        )}
      </Box>
    </EditorCard>
  );
}
