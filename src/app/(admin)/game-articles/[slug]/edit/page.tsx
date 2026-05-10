"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Box, TextField, MenuItem, Skeleton, Typography } from "@mui/material";
import Link from "next/link";
import Button from "@mui/material/Button";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useGameArticlesList,
  useGameArticle,
  useUpdateGameArticle,
} from "@/hooks/useGameArticles";
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
  gameSlugs: z.array(z.string()),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  focusKeywords: z.array(z.string()),
  showInBlog: z.boolean(),
  showInGameArticle: z.boolean(),
  showInBonusArticle: z.boolean(),
  showInCasinoArticle: z.boolean(),
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

export default function EditGameArticlePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: listData, isLoading: listLoading } = useGameArticlesList({
    q: slug,
    limit: 50,
  });
  const articleBySlug = useMemo(
    () => listData?.items?.find((a) => a.slug === slug) ?? null,
    [listData?.items, slug],
  );
  const id = articleBySlug?.id ?? null;
  const { data: article, isLoading: articleLoading } = useGameArticle(id);
  const update = useUpdateGameArticle(article?.id ?? "");
  const isLoading = listLoading || articleLoading;

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
      gameSlugs: [],
      seoTitle: "",
      seoDesc: "",
      focusKeywords: [],
      showInBlog: false,
      showInGameArticle: true,
      showInBonusArticle: false,
      showInCasinoArticle: false,
      status: "draft",
    },
  });

  useEffect(() => {
    if (!article) return;
    reset({
      title: article.title,
      slug: article.slug,
      shortDesc: article.shortDesc ?? "",
      publishDate: article.publishDate?.slice(0, 10) ?? "",
      readTime: article.readTime ?? "",
      featureImg: article.featureImg ?? "",
      content:
        typeof article.content === "string"
          ? article.content
          : JSON.stringify(article.content ?? {}, null, 2),
      tags: article.tags ?? [],
      gameSlugs: article.gameSlugs ?? [],
      seoTitle: article.seoTitle ?? "",
      seoDesc: article.seoDesc ?? "",
      focusKeywords: article.focusKeywords ?? [],
      showInBlog: article.showInBlog ?? false,
      showInGameArticle: article.showInGameArticle ?? false,
      showInBonusArticle: article.showInBonusArticle ?? false,
      showInCasinoArticle: article.showInCasinoArticle ?? true,
      status: article.status ?? "draft",
    });
  }, [article, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!article) return;
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
        gameSlugs: values.gameSlugs,
        seoTitle: values.seoTitle || undefined,
        seoDesc: values.seoDesc || undefined,
        focusKeywords: values.focusKeywords,
        showInBlog: values.showInBlog,
        showInGameArticle: values.showInGameArticle,
        showInBonusArticle: values.showInBonusArticle,
        showInCasinoArticle: values.showInCasinoArticle,
        status: values.status,
      });
      router.push("/game-articles");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "SLUG_EXISTS")
        setError("slug", { message: "Slug already in use" });
      else if (code === "FORBIDDEN")
        setError("root", {
          message: "You don't have permission to edit this article.",
        });
      else
        setError("root", {
          message: getDisplayErrorMessage(err, "Failed to update"),
        });
    }
  };

  if (!listLoading && listData && articleBySlug == null) {
    return (
      <Box>
        <Button component={Link} href="/game-articles" sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography color="text.secondary">Article not found.</Typography>
      </Box>
    );
  }
  if (isLoading || !article) {
    return (
      <Box>
        <Button component={Link} href="/game-articles" sx={{ mb: 2 }}>
          Back
        </Button>
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  const subtitle = (
    <>
      <Typography component="span" variant="body2" color="text.secondary">
        {article.slug}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}>
        <AuthorLine
          label="Created by"
          author={article.createdBy ?? undefined}
        />
        <AuthorLine
          label="Updated by"
          author={article.updatedBy ?? undefined}
        />
      </Box>
    </>
  );

  return (
    <ArticleEditorLayout
      title="Edit Game Article"
      subtitle={subtitle}
      backHref={`/game-articles/${article.slug}`}
      backLabel="Back to Article"
      submitLabel="Save changes"
      cancelHref={`/game-articles/${article.slug}`}
      unsavedDirty={isDirty}
      rootError={errors.root?.message}
      submitting={update.isPending}
      onSubmit={handleSubmit(onSubmit)}
      leftChildren={
        <>
          <CheckBoxesComponent control={control} />
          <EditorCard title="Article Title" required>
            <TextField
              fullWidth
              placeholder="Enter an engaging article title..."
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
                  placeholder="Start writing your article content here..."
                  minHeight={320}
                  aria-label="Article content"
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
                    placeholder="e.g. slots, bonus"
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
                  previewAlt={article.title}
                  helperText="PNG, JPG, GIF up to 5MB"
                />
              )}
            />
          </EditorCard>
          <EditorCard title="Game Slugs">
            <Controller
              name="gameSlugs"
              control={control}
              render={({ field }) => (
                <ChipsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="game-slug-1, game-slug-2"
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
                  placeholder="slots, review"
                />
              )}
            />
          </EditorCard>
        </>
      }
    />
  );
}
