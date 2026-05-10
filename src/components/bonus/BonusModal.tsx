"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bonusFormSchema,
  defaultBonusFormValues,
  type BonusFormValues,
  type BonusSubmitValues,
} from "@/lib/bonusSchema";
import { BONUS_TYPES, STATUS_LABELS } from "@/lib/constants";
import { slugFromTitle } from "@/lib/utils/slug";
import { IconPicker } from "./IconPicker";
import { BONUS_ICON_MAP } from "./bonusIconsMap";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import type { Bonus } from "@/lib/types";

function SafeIcon({ iconKey }: { iconKey: string }) {
  if (!iconKey) return null;
  const IconComponent = BONUS_ICON_MAP[iconKey];
  if (!IconComponent) return null;
  return <IconComponent fontSize="medium" />;
}

export interface BonusModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: BonusSubmitValues) => Promise<unknown>;
  bonus?: Bonus | null;
  title: string;
  submitLabel: string;
}

export function BonusModal({
  open,
  onClose,
  onSubmit,
  bonus,
  title,
  submitLabel,
}: BonusModalProps) {
  const theme = useTheme();
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BonusFormValues>({
    resolver: zodResolver(bonusFormSchema),
    defaultValues: defaultBonusFormValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "description" });
  const titleValue = watch("title");
  const slugValue = watch("slug");
  const iconKey = watch("iconKey");

  useEffect(() => {
    if (!open) return;
    if (bonus) {
      reset({
        title: bonus.title,
        slug: bonus.slug,
        featureImg: bonus.featureImg ?? "",
        description: bonus.description?.length
          ? bonus.description.map((s) => ({ value: s }))
          : [{ value: "" }],
        clientLink: bonus.clientLink ?? "",
        highlight: bonus.highlight ?? "",
        bonusType: bonus.bonusType ?? "",
        iconKey: bonus.iconKey ?? "",
        status: bonus.status,
      });
    } else {
      reset(defaultBonusFormValues);
    }
  }, [open, bonus, reset]);

  useEffect(() => {
    if (!bonus && titleValue) setValue("slug", slugFromTitle(titleValue));
  }, [bonus, titleValue, setValue]);

  const onFormSubmit = async (values: BonusFormValues) => {
    const description = values.description.map((d) => d.value).filter((s) => s.trim() !== "");
    await onSubmit({ ...values, description });
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              {...register("title")}
              label="Title"
              fullWidth
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: -1, mb: 0.5 }}>
              Slug: {slugValue || (titleValue ? slugFromTitle(titleValue) : "—")}
            </Typography>
            <Controller
              name="featureImg"
              control={control}
              render={({ field }) => (
                <ImageUploadField
                  label="Feature image"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  previewAlt={bonus?.title ?? "Bonus"}
                  helperText="Optional. PNG, JPG, GIF, WebP up to 5MB"
                />
              )}
            />
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <span style={{ fontSize: theme.typography.body2.fontSize, color: theme.palette.text.secondary }}>
                  Description (one line per item)
                </span>
                <Button
                  type="button"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => append({ value: "" })}
                >
                  Add line
                </Button>
              </Box>
              {fields.map((field, index) => (
                <Box key={field.id} sx={{ display: "flex", gap: 0.5, mb: 0.5 }}>
                  <TextField
                    {...register(`description.${index}.value`)}
                    fullWidth
                    size="small"
                    placeholder={`Description line ${index + 1}`}
                  />
                  <IconButton
                    type="button"
                    size="small"
                    color="error"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    aria-label="Remove line"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
            <TextField
              {...register("clientLink")}
              label="Client link (optional)"
              placeholder="https://…"
              fullWidth
              type="url"
              error={!!errors.clientLink}
              helperText={errors.clientLink?.message ?? "Affiliate URL when available; leave empty if not set yet."}
            />
            <TextField
              {...register("highlight")}
              label="Highlight"
              fullWidth
              error={!!errors.highlight}
              helperText={errors.highlight?.message}
            />
            <Controller
              name="bonusType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Bonus type"
                  fullWidth
                  error={!!errors.bonusType}
                  helperText={errors.bonusType?.message}
                >
                  {BONUS_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="iconKey"
              control={control}
              render={({ field }) => (
                <Box>
                  <Box sx={{ mb: 0.5, fontSize: theme.typography.body2.fontSize, color: theme.palette.text.secondary }}>
                    Icon
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() => setIconPickerOpen(true)}
                      sx={{
                        minWidth: 48,
                        height: 40,
                        p: 0,
                        borderColor: errors.iconKey ? "error.main" : "divider",
                      }}
                    >
                      {field.value ? (
                        <SafeIcon iconKey={field.value} />
                      ) : (
                        <span style={{ fontSize: theme.typography.body2.fontSize, color: theme.palette.text.secondary }}>
                          Pick
                        </span>
                      )}
                    </Button>
                    {field.value && (
                      <Box sx={{ fontSize: theme.typography.caption.fontSize, color: theme.palette.text.secondary }}>
                        {field.value}
                      </Box>
                    )}
                  </Box>
                  {errors.iconKey && (
                    <Box sx={{ mt: 0.5, fontSize: theme.typography.caption.fontSize, color: theme.palette.error.main }}>
                      {errors.iconKey.message}
                    </Box>
                  )}
                </Box>
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  fullWidth
                  error={!!errors.status}
                  helperText={errors.status?.message}
                >
                  {(["draft", "published", "pending"] as const).map((s) => (
                    <MenuItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : submitLabel}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <IconPicker
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={(key) => setValue("iconKey", key)}
        selectedIconKey={iconKey}
      />
    </>
  );
}
