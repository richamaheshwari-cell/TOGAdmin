"use client";

import { useState, useEffect } from "react";
import { Box, Button, Grid, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorCard } from "./EditorCard";

const UNSAVED_MESSAGE = "Your written data will be lost. Are you sure you want to leave?";

export interface ArticleEditorLayoutProps {
  /** e.g. "Create New Blog" / "Edit Blog" */
  title: string;
  /** e.g. "Fill in the details to publish a new blog post." */
  subtitle: React.ReactNode;
  /** Back link href (e.g. "/blogs" or "/blogs/slug") */
  backHref: string;
  /** Back link label (e.g. "Back to Blogs") */
  backLabel: string;
  /** Primary submit button label (e.g. "Publish Blog", "Save changes") */
  submitLabel: string;
  /** Cancel button href */
  cancelHref: string;
  /** When true, Back and Cancel show a confirmation before leaving */
  unsavedDirty?: boolean;
  /** Root error message to show */
  rootError?: string;
  /** Submit loading */
  submitting?: boolean;
  /** Form submit handler */
  onSubmit: (e: React.FormEvent) => void;
  /** Left column (main content): title, short desc, content, SEO */
  leftChildren: React.ReactNode;
  /** Right column (sidebar): publish settings, featured image, tags (+ optional game slugs etc.) */
  rightChildren: React.ReactNode;
}

export function ArticleEditorLayout({
  title,
  subtitle,
  backHref,
  backLabel,
  submitLabel,
  cancelHref,
  unsavedDirty = false,
  rootError,
  submitting = false,
  onSubmit,
  leftChildren,
  rightChildren,
}: ArticleEditorLayoutProps) {
  const router = useRouter();
  const [leaveConfirmHref, setLeaveConfirmHref] = useState<string | null>(null);

  useEffect(() => {
    if (!unsavedDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsavedDirty]);

  const handleNavigate = (href: string) => {
    if (unsavedDirty) {
      setLeaveConfirmHref(href);
    } else {
      router.push(href);
    }
  };

  const confirmLeave = () => {
    if (leaveConfirmHref) {
      router.push(leaveConfirmHref);
      setLeaveConfirmHref(null);
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "flex-start" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          {unsavedDirty ? (
            <Button startIcon={<ArrowBackIcon />} onClick={() => handleNavigate(backHref)} sx={{ mb: 1, px: 0 }}>
              {backLabel}
            </Button>
          ) : (
            <Button startIcon={<ArrowBackIcon />} component={Link} href={backHref} sx={{ mb: 1, px: 0 }}>
              {backLabel}
            </Button>
          )}
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
            {title}
          </Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          {unsavedDirty ? (
            <Button onClick={() => handleNavigate(cancelHref)} variant="outlined">
              Cancel
            </Button>
          ) : (
            <Button component={Link} href={cancelHref} variant="outlined">
              Cancel
            </Button>
          )}
          <Button type="submit" form="article-editor-form" variant="contained" color="primary" disabled={submitting}>
            {submitting ? "Saving…" : submitLabel}
          </Button>
        </Box>
      </Box>

      <Dialog open={!!leaveConfirmHref} onClose={() => setLeaveConfirmHref(null)}>
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogContent>
          <DialogContentText>{UNSAVED_MESSAGE}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveConfirmHref(null)}>Stay</Button>
          <Button variant="contained" color="primary" onClick={confirmLeave}>
            Leave
          </Button>
        </DialogActions>
      </Dialog>

      {rootError && (
        <Typography color="error" sx={{ mb: 2 }} component="div">
          {rootError}
        </Typography>
      )}

      <form id="article-editor-form" onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>{leftChildren}</Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>{rightChildren}</Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}

export { EditorCard };
