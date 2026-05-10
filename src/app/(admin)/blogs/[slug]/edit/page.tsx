"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Box, TextField, MenuItem, Skeleton, Typography } from "@mui/material";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import { useBlogsList, useBlog, useUpdateBlog } from "@/hooks/useBlogs";
import { ChipsInput } from "@/components/forms/ChipsInput";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { RichTextEditor } from "@/components/editor";
import {
  ArticleEditorLayout,
  EditorCard,
} from "@/components/editor/ArticleEditorLayout";
import CheckBoxesComponent from "@/components/editor/CheckBoxesComponet";
import { SeoFieldsCard } from "@/components/editor/SeoFieldsCard";
import { STATUS_LABELS } from "@/lib/constants";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import type { CreatedBy } from "@/lib/types";

const schema = z.object({
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  shortDesc: z.string(),
  publishDate: z.string().min(1),
  readTime: z.string().min(1),
  featureImg: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  focusKeywords: z.array(z.string()),
  showInBlog: z.boolean(),
  showInGameArticle: z.boolean(),
  showInBonusArticle: z.boolean(),
  showInCasinoArticle: z.boolean(),
  isFeatured: z.boolean(),
  status: z.enum(["published", "draft", "pending"]),
});

type FormValues = z.infer<typeof schema>;

function AuthorLine({
  label,
  author,
}: {
  label: string;
  author: CreatedBy | null | undefined;
}) {
  if (!author) return null;
  return (
    <Typography variant="body2" color="text.secondary">
      {label}: {author.name ?? author.email}
    </Typography>
  );
}

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: listData, isLoading: listLoading } = useBlogsList({
    q: slug,
    limit: 50,
  });
  const blogBySlug = useMemo(
    () => listData?.items?.find((b) => b.slug === slug) ?? null,
    [listData?.items, slug],
  );
  const id = blogBySlug?.id ?? null;
  const { data: blog, isLoading: blogLoading } = useBlog(id);
  const update = useUpdateBlog(blog?.id ?? "");
  const isLoading = listLoading || blogLoading;

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      shortDesc: "",
      publishDate: "",
      readTime: "",
      featureImg: "",
      content: "",
      tags: [],
      seoTitle: "",
      seoDesc: "",
      focusKeywords: [],
      showInBlog: true,
      showInGameArticle: false,
      showInBonusArticle: false,
      showInCasinoArticle: false,
      isFeatured: false,
      status: "draft",
    },
  });

  useEffect(() => {
    if (!blog) return;
    reset({
      title: blog.title,
      slug: blog.slug,
      shortDesc: blog.shortDesc ?? "",
      publishDate: blog.publishDate?.slice(0, 10) ?? "",
      readTime: blog.readTime ?? "",
      featureImg: blog.featureImg ?? "",
      content:
        typeof blog.content === "string"
          ? blog.content
          : JSON.stringify(blog.content ?? {}, null, 2),
      tags: blog.tags ?? [],
      seoTitle: blog.seoTitle ?? "",
      seoDesc: blog.seoDesc ?? "",
      focusKeywords: blog.focusKeywords ?? [],
      showInBlog: blog.showInBlog ?? false,
      showInGameArticle: blog.showInGameArticle ?? false,
      showInBonusArticle: blog.showInBonusArticle ?? false,
      showInCasinoArticle: blog.showInCasinoArticle ?? true,
      isFeatured: blog.isFeatured ?? false,
      status: blog.status ?? "draft",
    });
  }, [blog, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!blog) return;
    try {
      await update.mutateAsync({
        title: values.title,
        slug: values.slug,
        shortDesc: values.shortDesc,
        publishDate: new Date(values.publishDate).toISOString(),
        readTime: values.readTime,
        featureImg: values.featureImg || undefined,
        content: values.content?.trim()
          ? (() => {
              try {
                return JSON.parse(values.content!);
              } catch {
                return undefined;
              }
            })()
          : undefined,
        tags: values.tags,
        seoTitle: values.seoTitle || undefined,
        seoDesc: values.seoDesc || undefined,
        focusKeywords: values.focusKeywords,
        showInBlog: values.showInBlog,
        showInGameArticle: values.showInGameArticle,
        showInBonusArticle: values.showInBonusArticle,
        showInCasinoArticle: values.showInCasinoArticle,
        isFeatured: values.isFeatured,
        status: values.status,
      });
      router.push("/blogs");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "SLUG_EXISTS")
        setError("slug", { message: "Slug already in use" });
      else if (code === "FORBIDDEN")
        setError("root", {
          message: "You don't have permission to edit this blog.",
        });
      else
        setError("root", {
          message: getDisplayErrorMessage(err, "Failed to update"),
        });
    }
  };

  if (!listLoading && listData && blogBySlug == null) {
    return (
      <Box>
        <Button
          startIcon={<span>←</span>}
          component={Link}
          href="/blogs"
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Typography color="text.secondary">Blog not found.</Typography>
      </Box>
    );
  }

  if (isLoading || !blog) {
    return (
      <Box>
        <Button component={Link} href="/blogs" sx={{ mb: 2 }}>
          Back
        </Button>
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  const subtitle = (
    <>
      <Typography component="span" variant="body2" color="text.secondary">
        {blog.slug}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
        <AuthorLine label="Created by" author={blog.createdBy ?? undefined} />
        <AuthorLine label="Updated by" author={blog.updatedBy ?? undefined} />
      </Box>
    </>
  );

  return (
    <ArticleEditorLayout
      title="Edit Blog"
      subtitle={subtitle}
      backHref={`/blogs/${blog.slug}`}
      backLabel="Back to Blog"
      submitLabel="Save changes"
      cancelHref={`/blogs/${blog.slug}`}
      unsavedDirty={isDirty}
      rootError={errors.root?.message}
      submitting={update.isPending}
      onSubmit={handleSubmit(onSubmit)}
      leftChildren={
        <>
          <CheckBoxesComponent control={control} />
          <EditorCard title="Blog Title" required>
            <TextField
              fullWidth
              placeholder="Enter an engaging blog title..."
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
              size="small"
            />
            <Box
              component="span"
              sx={{
                display: "block",
                mt: 0.5,
                fontSize: "0.875rem",
                color: "text.secondary",
              }}
            >
              Slug: {watch("slug") || "—"}
            </Box>
          </EditorCard>
          <EditorCard title="Short Description">
            <TextField
              fullWidth
              placeholder="Write a brief summary..."
              {...register("shortDesc")}
              multiline
              rows={3}
              size="small"
            />
          </EditorCard>
          <EditorCard title="Content" required>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  output="json"
                  placeholder="Start writing your blog post content here..."
                  minHeight={320}
                  aria-label="Blog content"
                />
              )}
            />
          </EditorCard>
          <SeoFieldsCard
            seoTitle={watch("seoTitle") ?? ""}
            seoDesc={watch("seoDesc") ?? ""}
            onSeoTitleChange={(v) => setValue("seoTitle", v)}
            onSeoDescChange={(v) => setValue("seoDesc", v)}
            focusKeywordsNode={
              <Controller
                name="focusKeywords"
                control={control}
                render={({ field }) => (
                  <ChipsInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="casino, bonus, slots"
                  />
                )}
              />
            }
          />
        </>
      }
      rightChildren={
        <>
          <EditorCard title="Publish Settings">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                select
                size="small"
                label="Status"
                {...register("status")}
                fullWidth
              >
                <MenuItem value="published">{STATUS_LABELS.published}</MenuItem>
                <MenuItem value="draft">{STATUS_LABELS.draft}</MenuItem>
                <MenuItem value="pending">{STATUS_LABELS.pending}</MenuItem>
              </TextField>
              <TextField
                type="date"
                size="small"
                label="Publish Date"
                required
                {...register("publishDate")}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                size="small"
                label="Read Time"
                {...register("readTime")}
                placeholder="5 min read"
                fullWidth
              />
              <Controller
                name="isFeatured"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(_, v) => field.onChange(v)}
                      />
                    }
                    label="Featured Blog"
                  />
                )}
              />
              <Box
                component="span"
                sx={{
                  display: "block",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                }}
              >
                Show on homepage featured section
              </Box>
            </Box>
          </EditorCard>
          <EditorCard title="Featured Image">
            <Controller
              name="featureImg"
              control={control}
              render={({ field }) => (
                <ImageUploadField
                  label="Image URL"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  previewAlt={blog.title}
                  helperText="PNG, JPG, GIF up to 5MB"
                />
              )}
            />
          </EditorCard>
          <EditorCard title="Tags">
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <ChipsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="casino, bonus, review"
                />
              )}
            />
          </EditorCard>
        </>
      }
    />
  );
}
