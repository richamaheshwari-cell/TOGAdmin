"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, TextField, MenuItem, Chip, Autocomplete, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gameFormSchema, defaultGameFormValues, type GameFormValues } from "@/lib/gameSchema";
import { ChipsInput } from "@/components/forms/ChipsInput";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { RichTextEditor } from "@/components/editor";
import { ArticleEditorLayout, EditorCard } from "@/components/editor/ArticleEditorLayout";
import { SeoFieldsCard } from "@/components/editor/SeoFieldsCard";
import { useCreateGame } from "@/hooks/useGames";
import { useCasinosList } from "@/hooks/useCasinos";
import { STATUS_LABELS } from "@/lib/constants";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import { slugFromTitle } from "@/lib/utils/slug";
import type { Casino } from "@/lib/types";

export default function NewGamePage() {
  const router = useRouter();
  const createGame = useCreateGame();
  const { data: casinosData, isLoading: casinosLoading } = useCasinosList({ page: 1, limit: 100 });
  const casinoOptions = casinosData?.items ?? [];

  const {
    register,
    control,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: defaultGameFormValues,
  });

  const title = watch("title");
  const tagValue = watch("tag") ?? "";
  useEffect(() => {
    setValue("slug", title?.trim() ? slugFromTitle(title) : "");
  }, [title, setValue]);

  const onValidationError = () => {
    setError("root", {
      message: "Please fix the errors below. You must link at least one casino.",
    });
  };

  const onSubmit = async (values: GameFormValues) => {
    const slug = slugFromTitle(values.title);
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
      await createGame.mutateAsync({
        title: values.title.trim(),
        slug,
        casinoIds: values.casinoIds,
        featureImg: values.featureImg || undefined,
        tag: values.tag?.trim() || undefined,
        gameProvider: values.gameProvider,
        gameDetails: values.gameDetails,
        clientLink: values.clientLink || undefined,
        status: values.status,
        seoTitle: values.seoTitle?.trim() || undefined,
        seoDesc: values.seoDesc?.trim() || undefined,
        focusKeywords: values.focusKeywords.length ? values.focusKeywords : undefined,
        content: contentParsed,
      });
      router.push("/games");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "SLUG_EXISTS") {
        setError("title", { message: "A game with this title (slug) already exists." });
      } else if (code === "INVALID_CASINOS") {
        setError("root", {
          message: getDisplayErrorMessage(err, "One or more selected casinos are invalid. Refresh the list and try again."),
        });
      } else {
        setError("root", { message: getDisplayErrorMessage(err, "Failed to create game") });
      }
    }
  };

  return (
    <ArticleEditorLayout
      title="Add Game"
      subtitle="Create a game and link it to one or more casinos. Slug is set from the title."
      backHref="/games"
      backLabel="Back to Games"
      submitLabel="Create Game"
      cancelHref="/games"
      unsavedDirty={isDirty}
      rootError={errors.root?.message}
      submitting={createGame.isPending}
      onSubmit={handleSubmit(onSubmit, onValidationError)}
      leftChildren={
        <>
          <EditorCard title="Title" required>
            <TextField
              fullWidth
              placeholder="Game title"
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message ?? "2–200 characters"}
              size="small"
              inputProps={{ maxLength: 200 }}
            />
            <Box component="span" sx={{ display: "block", mt: 0.5, fontSize: "0.875rem", color: "text.secondary" }}>
              Slug: {watch("slug") || "—"}
            </Box>
          </EditorCard>
          <EditorCard title="Content (optional)">
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  output="json"
                  placeholder="Game description and details…"
                  minHeight={320}
                  aria-label="Game content"
                />
              )}
            />
          </EditorCard>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Optional SEO for this game. Title and description limits match the API (200 / 500). Add focus keywords as chips (comma or Enter; each 1–80 chars).
            </Typography>
            <SeoFieldsCard
              seoTitle={watch("seoTitle") ?? ""}
              seoDesc={watch("seoDesc") ?? ""}
              onSeoTitleChange={(v) => setValue("seoTitle", v)}
              onSeoDescChange={(v) => setValue("seoDesc", v)}
              seoTitleMax={200}
              seoDescMax={500}
              focusKeywordsNode={
                <Controller
                  name="focusKeywords"
                  control={control}
                  render={({ field }) => (
                    <ChipsInput value={field.value} onChange={field.onChange} placeholder="slots, jackpot — comma or Enter; each 1–80 chars" />
                  )}
                />
              }
            />
          </Box>
        </>
      }
      rightChildren={
        <>
          <EditorCard title="Linked casinos" required>
            <Controller
              name="casinoIds"
              control={control}
              render={({ field }) => (
                <Autocomplete<Casino, true, false, false>
                  multiple
                  loading={casinosLoading}
                  options={casinoOptions}
                  getOptionLabel={(opt) => opt.casinoName}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  value={casinoOptions.filter((c) => field.value.includes(c.id))}
                  onChange={(_, newValue) => field.onChange(newValue.map((c) => c.id))}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip variant="outlined" label={option.casinoName} {...getTagProps({ index })} key={option.id} size="small" />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Casinos"
                      placeholder="Search casinos…"
                      error={!!errors.casinoIds}
                      helperText={errors.casinoIds?.message ?? "Select at least one casino from the list."}
                    />
                  )}
                />
              )}
            />
          </EditorCard>
          <EditorCard title="Feature image">
            <Controller
              name="featureImg"
              control={control}
              render={({ field }) => (
                <ImageUploadField label="Image" value={field.value ?? ""} onChange={field.onChange} previewAlt="Game" helperText={errors.featureImg?.message} />
              )}
            />
          </EditorCard>
          <EditorCard title="Status & tag">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField select size="small" label="Status" {...register("status")} fullWidth>
                <MenuItem value="published">{STATUS_LABELS.published}</MenuItem>
                <MenuItem value="draft">{STATUS_LABELS.draft}</MenuItem>
                <MenuItem value="pending">{STATUS_LABELS.pending}</MenuItem>
              </TextField>
              <TextField
                size="small"
                label="Tag"
                placeholder="e.g. Slots"
                {...register("tag")}
                error={!!errors.tag}
                helperText={errors.tag?.message ?? `${tagValue.length}/15 characters (optional)`}
                fullWidth
                inputProps={{ maxLength: 15 }}
              />
            </Box>
          </EditorCard>
          <EditorCard title="Game providers">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Add each software provider as a chip: type a name and press <strong>Enter</strong>, or separate several names with a <strong>comma</strong> (e.g. <em>NetEnt, Pragmatic Play, Evolution</em>). Each entry can be up to 120 characters.
            </Typography>
            <Controller
              name="gameProvider"
              control={control}
              render={({ field }) => (
                <ChipsInput
                  label="Providers"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="NetEnt, Pragmatic Play — or type and press Enter"
                />
              )}
            />
          </EditorCard>
          <EditorCard title="Game details">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Short facts shown as chips (same as providers): e.g. <em>RTP 96.5%</em>, <em>High volatility</em>, <em>Max win 5000x</em>. Use comma or Enter after each item; each chip up to 200 characters.
            </Typography>
            <Controller
              name="gameDetails"
              control={control}
              render={({ field }) => (
                <ChipsInput
                  label="Details"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="RTP 96.5%, High volatility — comma or Enter for each chip"
                />
              )}
            />
          </EditorCard>
          <EditorCard title="Client link">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Affiliate or play link for this game (must be a valid URL).
            </Typography>
            <TextField fullWidth size="small" label="Affiliate URL" placeholder="https://…" {...register("clientLink")} error={!!errors.clientLink} helperText={errors.clientLink?.message} />
          </EditorCard>
        </>
      }
    />
  );
}
