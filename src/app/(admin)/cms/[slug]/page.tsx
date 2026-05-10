"use client";

import { useParams } from "next/navigation";
import { Box, Button, Paper, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import Link from "next/link";
import { usePageBySlug } from "@/hooks/usePages";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@mui/material";
import type { CreatedBy } from "@/lib/types";

function AuthorLine({ label, author }: { label: string; author: CreatedBy | null | undefined }) {
  if (!author) return null;
  return (
    <Typography variant="body2" color="text.secondary">
      {label}: {author.name ?? author.email}
    </Typography>
  );
}

export default function PageViewRoute() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: page, isLoading } = usePageBySlug(slug);
  const { user } = useAuth();
  const canEdit = page && (!user?.id || page.createdBy?.id === user?.id);

  if (isLoading || !page) {
    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/cms" sx={{ mb: 2 }}>Back</Button>
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "flex-start" }, mb: 2, gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/cms">Back to Pages</Button>
        {canEdit && (
          <Button component={Link} href={`/cms/${page.slug}/edit`} variant="contained" color="primary" startIcon={<EditIcon />}>
            Edit
          </Button>
        )}
      </Box>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>{page.title}</Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>{page.slug}</Typography>
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        <AuthorLine label="Created by" author={page.createdBy ?? undefined} />
        <AuthorLine label="Updated by" author={page.updatedBy ?? undefined} />
      </Box>
      <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: "hidden" }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>Content</Typography>
        <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 1 }} component="div" dangerouslySetInnerHTML={{ __html: page.contentHtml || "" }} />
        {page.seoTitle && <Typography variant="body2" sx={{ mt: 2 }}>SEO Title: {page.seoTitle}</Typography>}
        {page.seoDesc && <Typography variant="body2">SEO Desc: {page.seoDesc}</Typography>}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Updated: {new Date(page.updatedAt).toLocaleString("en-US", { timeZone: "UTC" })}
        </Typography>
      </Paper>
    </Box>
  );
}
