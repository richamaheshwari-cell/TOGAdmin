"use client";

import { useParams } from "next/navigation";
import { Box, Button, Paper, Typography, Chip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import Link from "next/link";
import { useBlogBySlug } from "@/hooks/useBlogs";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@mui/material";
import { STATUS_LABELS } from "@/lib/constants";
import { canEditOwnedContent } from "@/lib/contentPermissions";
import type { CreatedBy } from "@/lib/types";

function AuthorLine({ label, author }: { label: string; author: CreatedBy | null | undefined }) {
  if (!author) return null;
  return (
    <Typography variant="body2" color="text.secondary">
      {label}: {author.name ?? author.email}
    </Typography>
  );
}

export default function BlogViewPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: blog, isLoading } = useBlogBySlug(slug);
  const { user } = useAuth();
  const canEdit = Boolean(blog && canEditOwnedContent(user?.role, user?.id, blog.createdBy?.id));

  if (isLoading || !blog) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/blogs" sx={{ mb: 2 }}>Back</Button>
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "flex-start" }, mb: 2, gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/blogs">Back to Blogs</Button>
        {canEdit && (
          <Button component={Link} href={`/blogs/${blog.slug}/edit`} variant="contained" color="primary" startIcon={<EditIcon />}>Edit</Button>
        )}
      </Box>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>{blog.title}</Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>{blog.slug}</Typography>
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        <AuthorLine label="Created by" author={blog.createdBy ?? undefined} />
        <AuthorLine label="Updated by" author={blog.updatedBy ?? undefined} />
      </Box>
      <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: "hidden" }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Chip label={STATUS_LABELS[blog.status] ?? blog.status} size="small" />
          {blog.isFeatured && <Chip label="Featured" size="small" color="primary" />}
        </Box>
        {blog.shortDesc && <Typography sx={{ mb: 2 }}>{blog.shortDesc}</Typography>}
        <Typography variant="body2" color="text.secondary">
          Published: {new Date(blog.publishDate).toLocaleDateString("en-US", { timeZone: "UTC" })} · {blog.readTime}
        </Typography>
        {blog.tags?.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 2 }}>
            {blog.tags.map((t, i) => <Chip key={i} label={t} size="small" />)}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
          Updated: {new Date(blog.updatedAt).toLocaleString("en-US", { timeZone: "UTC" })}
        </Typography>
      </Paper>
    </Box>
  );
}
