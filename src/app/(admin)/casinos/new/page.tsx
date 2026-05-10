"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { casinoFormSchema, defaultCasinoFormValues, type CasinoFormValues } from "@/lib/casinoSchema";
import { ChipsInput } from "@/components/forms/ChipsInput";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { RichTextEditor } from "@/components/editor";
import { ArticleEditorLayout, EditorCard } from "@/components/editor/ArticleEditorLayout";
import { SeoFieldsCard } from "@/components/editor/SeoFieldsCard";
import { useCreateCasino } from "@/hooks/useCasinos";
import { STATUS_LABELS } from "@/lib/constants";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import { slugFromTitle } from "@/lib/utils/slug";

export default function NewCasinoPage() {
  const router = useRouter();
  const createCasino = useCreateCasino();

  const {
    register,
    control,
    handleSubmit,
    setError,
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

  const casinoName = watch("casinoName");
  useEffect(() => {
    setValue("slug", casinoName?.trim() ? slugFromTitle(casinoName) : "");
  }, [casinoName, setValue]);

  const onSubmit = async (values: CasinoFormValues) => {
    const slug = slugFromTitle(values.casinoName);
    try {
      const payload = {
        casinoName: values.casinoName.trim(),
        slug,
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
        content: values.content?.trim()
          ? (() => {
              try {
                return JSON.parse(values.content!);
              } catch {
                return undefined;
              }
            })()
          : undefined,
      };
      await createCasino.mutateAsync(payload);
      router.push("/casinos");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "SLUG_EXISTS") {
        setError("casinoName", { message: "A casino with this name (slug) already exists. Try a different name." });
      } else {
        setError("root", { message: getDisplayErrorMessage(err, "Failed to create casino") });
      }
    }
  };

  return (
    <ArticleEditorLayout
      title="Add Casino"
      subtitle="Create a new casino listing. Slug is set from name and cannot be edited."
      backHref="/casinos"
      backLabel="Back to Casinos"
      submitLabel="Create Casino"
      cancelHref="/casinos"
      unsavedDirty={isDirty}
      rootError={errors.root?.message}
      submitting={createCasino.isPending}
      onSubmit={handleSubmit(onSubmit, onValidationError)}
      leftChildren={
        <>
          <EditorCard title="Casino name" required>
            <TextField
              fullWidth
              placeholder="e.g. Royal Vegas Casino"
              {...register("casinoName")}
              error={!!errors.casinoName}
              helperText={errors.casinoName?.message ?? "2–120 characters. Slug is set from name and cannot be edited."}
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
              <strong>SEO (required):</strong> meta title and description for search. Counters under each field; use <strong>Tags</strong> in the sidebar for focus topics.
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
              Main thumbnail for listings and cards. Upload an image (PNG, JPG, etc.) or paste a URL after upload.
            </Typography>
            <Controller
              name="featureImg"
              control={control}
              render={({ field }) => (
                <ImageUploadField
                  label="Image"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  previewAlt="Casino"
                  helperText={errors.featureImg?.message}
                />
              )}
            />
          </EditorCard>
          <EditorCard title="Status & rating">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Publication state, star-style rating (0–5), how many reviews to show, and approximate game count for this casino.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField select size="small" label="Status" {...register("status")} fullWidth>
                <MenuItem value="published">{STATUS_LABELS.published}</MenuItem>
                <MenuItem value="draft">{STATUS_LABELS.draft}</MenuItem>
                <MenuItem value="pending">{STATUS_LABELS.pending}</MenuItem>
              </TextField>
              <TextField
                type="number"
                size="small"
                label="Rating (0–5)"
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                {...register("rating", { valueAsNumber: true })}
                error={!!errors.rating}
                helperText={errors.rating?.message}
                fullWidth
              />
              <TextField
                type="number"
                size="small"
                label="Review count"
                inputProps={{ min: 0 }}
                {...register("reviewCount", { valueAsNumber: true })}
                error={!!errors.reviewCount}
                helperText={errors.reviewCount?.message}
                fullWidth
              />
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
              <strong>Bonus amount</strong> and <strong>payout speed</strong> are required. Use dollars only for the amount (e.g. <em>1200</em> or <em>$1200</em>). Payout speed is max 15 characters (e.g. <em>24–48h</em>).
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                size="small"
                label="Bonus amount"
                placeholder="1200 or $1200"
                {...register("bonusAmt")}
                error={!!errors.bonusAmt}
                helperText={errors.bonusAmt?.message ?? "Required. Dollars only (e.g. 1200 or $1200). Max 120 chars."}
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
                <strong>Bonus details</strong> (optional): short selling points as chips — e.g. <em>200 free spins</em>, <em>Welcome package</em>. Type and press <strong>Enter</strong>, or use commas. Each chip 1–80 characters.
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
              <strong>Required:</strong> at least one tag. Used for filtering and SEO focus. Add chips with <strong>Enter</strong> or separate with <strong>commas</strong> (e.g. <em>slots, live casino, crypto</em>). Each tag 1–40 characters.
            </Typography>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <ChipsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="slots, crypto, UK licensed — comma or Enter"
                />
              )}
            />
            {errors.tags?.message && (
              <Box component="span" sx={{ display: "block", mt: 0.5, fontSize: "0.75rem", color: "error.main" }}>
                {errors.tags.message}
              </Box>
            )}
          </EditorCard>
          <EditorCard title="Client link">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Optional affiliate or signup URL for this casino. Must be a valid <code>https://</code> link if provided.
            </Typography>
            <TextField fullWidth size="small" label="Affiliate URL" placeholder="https://..." {...register("clientLink")} error={!!errors.clientLink} helperText={errors.clientLink?.message} />
          </EditorCard>
        </>
      }
    />
  );
}
