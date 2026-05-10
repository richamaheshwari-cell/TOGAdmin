"use client";

import { useParams, useRouter } from "next/navigation";
import { Box, TextField, MenuItem, Skeleton, Typography } from "@mui/material";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { casinoFormSchema, defaultCasinoFormValues, type CasinoFormValues } from "@/lib/casinoSchema";
import { ChipsInput } from "@/components/forms/ChipsInput";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { RichTextEditor } from "@/components/editor";
import { ArticleEditorLayout, EditorCard } from "@/components/editor/ArticleEditorLayout";
import { SeoFieldsCard } from "@/components/editor/SeoFieldsCard";
import { useCasinoBySlug, useUpdateCasino } from "@/hooks/useCasinos";
import { STATUS_LABELS } from "@/lib/constants";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import type { CreatedBy } from "@/lib/types";

function AuthorLine({ label, author }: { label: string; author: CreatedBy | null | undefined }) {
  if (!author) return null;
  return (
    <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1.5 }}>
      {label}: {author.name ?? author.email}
    </Typography>
  );
}

export default function EditCasinoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: casino, isLoading } = useCasinoBySlug(slug);
  const updateCasino = useUpdateCasino(casino?.id ?? "");

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CasinoFormValues>({
    resolver: zodResolver(casinoFormSchema),
    defaultValues: defaultCasinoFormValues,
  });

  const onValidationError = () => {
    setError("root", {
      message: "Please complete all required fields: Casino name, Bonus amount, Payout speed, at least one Tag, SEO title and SEO description.",
    });
  };

  useEffect(() => {
    if (!casino) return;
    const contentStr =
      typeof casino.content === "string"
        ? casino.content
        : casino.content != null
          ? JSON.stringify(casino.content)
          : "";
    reset({
      casinoName: casino.casinoName,
      slug: casino.slug, // read-only: slug cannot be edited
      featureImg: casino.featureImg ?? "",
      rating: casino.rating ?? 0,
      status: casino.status,
      reviewCount: casino.reviewCount,
      bonusAmt: casino.bonusAmt ?? "",
      bonusDetails: casino.bonusDetails ?? [],
      totalGames: casino.totalGames ?? null,
      tags: casino.tags?.length ? casino.tags : [],
      payoutSpeed: casino.payoutSpeed ?? "",
      clientLink: casino.clientLink ?? "",
      seoTitle: casino.seoTitle ?? "",
      seoDesc: casino.seoDesc ?? "",
      content: contentStr,
    });
  }, [casino, reset]);

  const onSubmit = async (values: CasinoFormValues) => {
    if (!casino) return;
    try {
      const contentParsed = values.content?.trim()
        ? (() => {
            try {
              return JSON.parse(values.content!);
            } catch {
              return undefined;
            }
          })()
        : undefined;
      await updateCasino.mutateAsync({
        casinoName: values.casinoName,
        slug: values.slug,
        featureImg: values.featureImg || undefined,
        rating: values.rating,
        status: values.status,
        reviewCount: values.reviewCount,
        bonusAmt: values.bonusAmt.trim() || undefined,
        bonusDetails: values.bonusDetails,
        totalGames: values.totalGames ?? undefined,
        tags: values.tags,
        payoutSpeed: values.payoutSpeed.trim() || undefined,
        clientLink: values.clientLink || undefined,
        seoTitle: values.seoTitle?.trim() || undefined,
        seoDesc: values.seoDesc?.trim() || undefined,
        content: contentParsed,
      });
      router.push("/casinos");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "SLUG_EXISTS") setError("casinoName", { message: "This slug is already in use." });
      else if (code === "FORBIDDEN") setError("root", { message: "You don't have permission to edit this casino." });
      else setError("root", { message: getDisplayErrorMessage(err, "Failed to update casino") });
    }
  };

  if (isLoading || !casino) {
    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  const subtitle = (
    <>
      {casino.casinoName}
      <Box component="span" sx={{ display: "block", mt: 0.5 }}>
        <AuthorLine label="Created by" author={casino.createdBy ?? undefined} />
        <AuthorLine label="Updated by" author={casino.updatedBy ?? undefined} />
        {casino.createdAt && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1.5 }}>
            Created: {new Date(casino.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}
          </Typography>
        )}
        {casino.updatedAt && (
          <Typography component="span" variant="body2" color="text.secondary">
            Updated: {new Date(casino.updatedAt).toLocaleString("en-US", { timeZone: "UTC" })}
          </Typography>
        )}
      </Box>
    </>
  );

  return (
    <ArticleEditorLayout
      title="Edit Casino"
      subtitle={subtitle}
      backHref={`/casinos/${casino.slug}`}
      backLabel="Back to Casino"
      submitLabel="Save changes"
      cancelHref={`/casinos/${casino.slug}`}
      unsavedDirty={isDirty}
      rootError={errors.root?.message}
      submitting={updateCasino.isPending}
      onSubmit={handleSubmit(onSubmit, onValidationError)}
      leftChildren={
        <>
          <EditorCard title="Casino name" required>
            <TextField
              fullWidth
              {...register("casinoName")}
              error={!!errors.casinoName}
              helperText={errors.casinoName?.message ?? "2–120 characters. Slug cannot be edited."}
              size="small"
              inputProps={{ maxLength: 120 }}
            />
            <Box component="span" sx={{ display: "block", mt: 0.5, fontSize: "0.875rem", color: "text.secondary" }}>
              Slug: {watch("slug") || "—"}
            </Box>
          </EditorCard>
          <EditorCard title="Content (optional)">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Long-form casino copy for the public site. Optional; use the rich text editor for headings, lists, and images.
            </Typography>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  output="json"
                  placeholder="Write casino description and details..."
                  minHeight={320}
                  aria-label="Casino content"
                />
              )}
            />
          </EditorCard>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              <strong>SEO (required):</strong> meta title and description. Counters under each field; use <strong>Tags</strong> for focus topics.
            </Typography>
            <SeoFieldsCard
              seoTitle={watch("seoTitle") ?? ""}
              seoDesc={watch("seoDesc") ?? ""}
              onSeoTitleChange={(v) => setValue("seoTitle", v)}
              onSeoDescChange={(v) => setValue("seoDesc", v)}
            />
          </Box>
        </>
      }
      rightChildren={
        <>
          <EditorCard title="Feature image">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Main thumbnail for listings and cards. Upload an image or paste a URL after upload.
            </Typography>
            <Controller
              name="featureImg"
              control={control}
              render={({ field }) => (
                <ImageUploadField label="Image" value={field.value ?? ""} onChange={field.onChange} previewAlt={casino.casinoName} helperText={errors.featureImg?.message} />
              )}
            />
          </EditorCard>
          <EditorCard title="Status & rating">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Publication state, rating (0–5), review count, and approximate total games for this casino.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField select size="small" label="Status" {...register("status")} fullWidth>
                <MenuItem value="published">{STATUS_LABELS.published}</MenuItem>
                <MenuItem value="draft">{STATUS_LABELS.draft}</MenuItem>
                <MenuItem value="pending">{STATUS_LABELS.pending}</MenuItem>
              </TextField>
              <TextField type="number" size="small" label="Rating (0–5)" inputProps={{ min: 0, max: 5, step: 0.1 }} {...register("rating", { valueAsNumber: true })} error={!!errors.rating} helperText={errors.rating?.message} fullWidth />
              <TextField type="number" size="small" label="Review count" inputProps={{ min: 0 }} {...register("reviewCount", { valueAsNumber: true })} error={!!errors.reviewCount} helperText={errors.reviewCount?.message} fullWidth />
              <TextField
                type="number"
                size="small"
                label="Total games"
                inputProps={{ min: 0 }}
                {...register("totalGames", { valueAsNumber: true, setValueAs: (v) => (v === "" || isNaN(v) ? null : v) })}
                error={!!errors.totalGames}
                helperText={errors.totalGames?.message}
                fullWidth
              />
            </Box>
          </EditorCard>
          <EditorCard title="Bonus & payout">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              <strong>Bonus amount</strong> and <strong>payout speed</strong> are required. Dollars only for amount; payout speed max 15 characters.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                size="small"
                label="Bonus amount"
                placeholder="1200 or $1200"
                {...register("bonusAmt")}
                error={!!errors.bonusAmt}
                helperText={errors.bonusAmt?.message ?? "Required. Dollars only. Max 120 chars."}
                fullWidth
                inputProps={{ maxLength: 120 }}
              />
              <TextField
                size="small"
                label="Payout speed"
                placeholder="e.g. 24–48h"
                {...register("payoutSpeed")}
                error={!!errors.payoutSpeed}
                helperText={errors.payoutSpeed?.message ?? "Required. Max 15 characters."}
                fullWidth
                inputProps={{ maxLength: 15 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <strong>Bonus details</strong> (optional): selling points as chips — use <strong>Enter</strong> or <strong>commas</strong>. Each 1–80 characters.
              </Typography>
              <Controller
                name="bonusDetails"
                control={control}
                render={({ field }) => (
                  <ChipsInput
                    label="Bonus details (optional)"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="200 free spins, Welcome pack — comma or Enter"
                  />
                )}
              />
            </Box>
          </EditorCard>
          <EditorCard title="Tags" required>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              <strong>Required:</strong> at least one tag for filtering and SEO. Chips via <strong>Enter</strong> or <strong>commas</strong>; each tag 1–40 characters.
            </Typography>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => <ChipsInput value={field.value} onChange={field.onChange} placeholder="slots, crypto, UK licensed — comma or Enter" />}
            />
            {errors.tags?.message && (
              <Box component="span" sx={{ display: "block", mt: 0.5, fontSize: "0.75rem", color: "error.main" }}>
                {errors.tags.message}
              </Box>
            )}
          </EditorCard>
          <EditorCard title="Client link">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Optional affiliate or signup URL; must be valid <code>https://</code> if set.
            </Typography>
            <TextField fullWidth size="small" label="Affiliate URL" {...register("clientLink")} error={!!errors.clientLink} helperText={errors.clientLink?.message} />
          </EditorCard>
        </>
      }
    />
  );
}
