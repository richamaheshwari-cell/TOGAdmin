"use client";

import { useParams, useRouter } from "next/navigation";
import { Box, Button, Paper, TextField, Typography, Skeleton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { usePageBySlug, useUpdatePage } from "@/hooks/usePages";
import { RichTextEditor } from "@/components/editor";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import type { CreatedBy } from "@/lib/types";

function AuthorLine({ label, author }: { label: string; author: CreatedBy | null | undefined }) {
  if (!author) return null;
  return (
    <Typography variant="body2" color="text.secondary">
      {label}: {author.name ?? author.email}
    </Typography>
  );
}

const schema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  title: z.string().min(1),
  contentHtml: z.string(),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

export default function EditPageRoute() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: page, isLoading } = usePageBySlug(slug);
  const updatePage = useUpdatePage(page?.id ?? "");

  const { register, control, handleSubmit, setError, reset, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { slug: "", title: "", contentHtml: "", seoTitle: "", seoDesc: "", isPublished: false, sortOrder: 0 },
  });

  useEffect(() => {
    if (!page) return;
    reset({
      slug: page.slug,
      title: page.title,
      contentHtml: page.contentHtml ?? "",
      seoTitle: page.seoTitle ?? "",
      seoDesc: page.seoDesc ?? "",
      isPublished: page.isPublished,
      sortOrder: page.sortOrder,
    });
  }, [page, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!page) return;
    try {
      await updatePage.mutateAsync({
        slug: values.slug,
        title: values.title,
        contentHtml: values.contentHtml,
        seoTitle: values.seoTitle || undefined,
        seoDesc: values.seoDesc || undefined,
        isPublished: values.isPublished,
        sortOrder: values.sortOrder,
      });
      router.push("/cms");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "SLUG_EXISTS") setError("slug", { message: "This slug is already in use" });
      else if (code === "FORBIDDEN") setError("root", { message: "You don't have permission to edit this page." });
      else setError("root", { message: getDisplayErrorMessage(err, "Failed to update") });
    }
  };

  if (isLoading || !page) {
    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/cms" sx={{ mb: 2 }}>Back</Button>
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Button startIcon={<ArrowBackIcon />} component={Link} href={`/cms/${page.slug}`} sx={{ mb: 2 }}>Back to Page</Button>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>Edit Page</Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>{page.title}</Typography>
      <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        <AuthorLine label="Created by" author={page.createdBy ?? undefined} />
        <AuthorLine label="Updated by" author={page.updatedBy ?? undefined} />
        <Typography variant="body2" color="text.secondary">Created: {page.createdAt ? new Date(page.createdAt).toLocaleString("en-US", { timeZone: "UTC" }) : "—"}</Typography>
        <Typography variant="body2" color="text.secondary">Updated: {page.updatedAt ? new Date(page.updatedAt).toLocaleString("en-US", { timeZone: "UTC" }) : "—"}</Typography>
      </Box>
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {errors.root && <Typography color="error" sx={{ mb: 2 }}>{errors.root.message}</Typography>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Title" {...register("title")} error={!!errors.title} helperText={errors.title?.message} fullWidth required />
            <Typography variant="body2" color="text.secondary">Slug: {watch("slug") || "—"}</Typography>
            <Controller
              name="contentHtml"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  output="html"
                  placeholder="Write your page content…"
                  minHeight={320}
                  aria-label="Page content"
                />
              )}
            />
            <TextField label="SEO Title" {...register("seoTitle")} fullWidth />
            <TextField label="SEO Description" {...register("seoDesc")} multiline rows={2} fullWidth />
            <TextField type="number" label="Sort order" {...register("sortOrder", { valueAsNumber: true })} inputProps={{ min: 0 }} fullWidth />
            <Controller
              name="isPublished"
              control={control}
              render={({ field }) => (
                <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="Published" />
              )}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button type="submit" variant="contained" color="primary" disabled={updatePage.isPending}>Save changes</Button>
              <Button component={Link} href={`/cms/${page.slug}`}>Cancel</Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
