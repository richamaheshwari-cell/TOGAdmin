"use client";

import { useParams, useRouter } from "next/navigation";
import { Box, TextField, MenuItem, Chip, Autocomplete, Skeleton, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { gameFormSchema, defaultGameFormValues, type GameFormValues } from "@/lib/gameSchema";
import { ChipsInput } from "@/components/forms/ChipsInput";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { RichTextEditor } from "@/components/editor";
import { ArticleEditorLayout, EditorCard } from "@/components/editor/ArticleEditorLayout";
import { SeoFieldsCard } from "@/components/editor/SeoFieldsCard";
import { useGameBySlug, useUpdateGame } from "@/hooks/useGames";
import { useCasinosList } from "@/hooks/useCasinos";
import { STATUS_LABELS } from "@/lib/constants";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import type { CreatedBy, Casino } from "@/lib/types";

function AuthorLine({ label, author }: { label: string; author: CreatedBy | null | undefined }) {
  if (!author) return null;
  return (
    <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1.5 }}>
      {label}: {author.name ?? author.email}
    </Typography>
  );
}

export default function EditGamePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { data: game, isLoading } = useGameBySlug(slug);
  const updateGame = useUpdateGame(game?.id ?? "");
  const { data: casinosData, isLoading: casinosLoading } = useCasinosList({ page: 1, limit: 100 });
  const casinoOptions = casinosData?.items ?? [];

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameFormSchema),
    defaultValues: defaultGameFormValues,
  });

  const tagValue = watch("tag") ?? "";

  useEffect(() => {
    if (!game) return;
    const contentStr =
      typeof game.content === "string"
        ? game.content
        : game.content != null
          ? JSON.stringify(game.content)
          : "";
    reset({
      title: game.title,
      slug: game.slug,
      casinoIds: game.casinos?.map((c) => c.id) ?? [],
      featureImg: game.featureImg ?? "",
      tag: game.tag ?? "",
      gameProvider: game.gameProvider ?? [],
      gameDetails: game.gameDetails ?? [],
      clientLink: game.clientLink ?? "",
      status: game.status,
      seoTitle: game.seoTitle ?? "",
      seoDesc: game.seoDesc ?? "",
      focusKeywords: game.focusKeywords ?? [],
      content: contentStr,
    });
  }, [game, reset]);

  const onValidationError = () => {
    setError("root", {
      message: "Please fix the errors below. You must keep at least one linked casino.",
    });
  };

  const onSubmit = async (values: GameFormValues) => {
    if (!game) return;
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
      await updateGame.mutateAsync({
        title: values.title.trim(),
        slug: values.slug,
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
      if (code === "SLUG_EXISTS") setError("title", { message: "This slug is already in use" });
      else if (code === "INVALID_CASINOS") {
        setError("root", {
          message: getDisplayErrorMessage(err, "One or more selected casinos are invalid."),
        });
      } else if (code === "FORBIDDEN") setError("root", { message: "You don't have permission to edit this game." });
      else setError("root", { message: getDisplayErrorMessage(err, "Failed to update game") });
    }
  };

  if (isLoading || !game) {
    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  const subtitle = (
    <>
      {game.title}
      <Box component="span" sx={{ display: "block", mt: 0.5 }}>
        <AuthorLine label="Created by" author={game.createdBy ?? undefined} />
        <AuthorLine label="Updated by" author={game.updatedBy ?? undefined} />
        {game.createdAt && (
          <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 1.5 }}>
            Created: {new Date(game.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}
          </Typography>
        )}
        {game.updatedAt && (
          <Typography component="span" variant="body2" color="text.secondary">
            Updated: {new Date(game.updatedAt).toLocaleString("en-US", { timeZone: "UTC" })}
          </Typography>
        )}
      </Box>
    </>
  );

  return (
    <ArticleEditorLayout
      title="Edit Game"
      subtitle={subtitle}
      backHref={`/games/${game.slug}`}
      backLabel="Back to Game"
      submitLabel="Save changes"
      cancelHref={`/games/${game.slug}`}
      unsavedDirty={isDirty}
      rootError={errors.root?.message}
      submitting={updateGame.isPending}
      onSubmit={handleSubmit(onSubmit, onValidationError)}
      leftChildren={
        <>
          <EditorCard title="Title" required>
            <TextField
              fullWidth
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
              Optional SEO. Title / description max 200 / 500. Focus keywords as chips (comma or Enter; each 1–80 chars).
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
                  render={({ field }) => <ChipsInput value={field.value} onChange={field.onChange} placeholder="slots, jackpot — comma or Enter" />}
                />
              }
            />
          </Box>
        </>
      }
      rightChildren={
        <>
          <EditorCard title="Linked casinos" required>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Choose which casinos offer this game (many-to-many). Search by name, then select one or more. At least one casino is required; you can link up to 100.
            </Typography>
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
                <ImageUploadField label="Image" value={field.value ?? ""} onChange={field.onChange} previewAlt={game.title} helperText={errors.featureImg?.message} />
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
                <ChipsInput value={field.value} onChange={field.onChange} placeholder="NetEnt, Pragmatic Play — or type and press Enter" />
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
                <ChipsInput value={field.value} onChange={field.onChange} placeholder="RTP 96.5%, High volatility — comma or Enter for each chip" />
              )}
            />
          </EditorCard>
          <EditorCard title="Client link">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Affiliate or play link for this game (must be a valid URL).
            </Typography>
            <TextField fullWidth size="small" label="Affiliate URL" {...register("clientLink")} error={!!errors.clientLink} helperText={errors.clientLink?.message} />
          </EditorCard>
        </>
      }
    />
  );
}
