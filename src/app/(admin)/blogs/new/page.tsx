"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, TextField, MenuItem } from "@mui/material";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useCreateBlog } from "@/hooks/useBlogs";
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
import { slugFromTitle } from "@/lib/utils/slug";

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

export default function NewBlogPage() {
  const router = useRouter();
  const create = useCreateBlog();

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      shortDesc: "",
      publishDate: new Date().toISOString().slice(0, 10),
      readTime: "5 min read",
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

  const title = watch("title");
  useEffect(() => {
    if (title) setValue("slug", slugFromTitle(title));
  }, [title, setValue]);

  const onSubmit = async (values: FormValues) => {
    const slug = slugFromTitle(values.title);
    try {
      await create.mutateAsync({
        title: values.title,
        slug,
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
        setError("title", {
          message:
            "A blog with this title (slug) already exists. Try a different title.",
        });
      else
        setError("root", {
          message: getDisplayErrorMessage(err, "Failed to create"),
        });
    }
  };

  return (
    <ArticleEditorLayout
      title="Create New Blog"
      subtitle="Fill in the details to publish a new blog post."
      backHref="/blogs"
      backLabel="Back to Blogs"
      submitLabel="Publish Blog"
      cancelHref="/blogs"
      unsavedDirty={isDirty}
      rootError={errors.root?.message}
      submitting={create.isPending}
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
              placeholder="Write a brief summary that appears in blog listings..."
              {...register("shortDesc")}
              multiline
              rows={3}
              size="small"
            />
            <Box
              component="span"
              sx={{
                display: "block",
                mt: 0.5,
                fontSize: "0.75rem",
                color: "text.secondary",
              }}
            >
              This will be shown as the excerpt in blog cards
            </Box>
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
                    placeholder="casino, bonus, slots (comma separated)"
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
                  previewAlt="Blog"
                  helperText="PNG, JPG, GIF up to 5MB. Or paste image URL below."
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
            <Box
              component="span"
              sx={{
                display: "block",
                mt: 0.5,
                fontSize: "0.75rem",
                color: "text.secondary",
              }}
            >
              Separate tags with commas or add as chips
            </Box>
          </EditorCard>
        </>
      }
    />
  );
}
