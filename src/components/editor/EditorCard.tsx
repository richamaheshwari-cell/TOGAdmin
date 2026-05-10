"use client";

import { Box, Paper, Typography } from "@mui/material";

export interface EditorCardProps {
  title: string;
  /** Optional icon (e.g. Search for SEO) */
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** If set, show required asterisk */
  required?: boolean;
}

export function EditorCard({ title, icon, children, required }: EditorCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        {icon}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
          {required && <Box component="span" sx={{ color: "error.main" }}> *</Box>}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
}
