"use client";

import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useSettings, useUpdateSettings } from "@/hooks/useSettings";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import type { Settings } from "@/lib/types";
import { Skeleton } from "@mui/material";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<Partial<Settings> & { maintenanceMode: boolean }>({
    defaultValues: {
      siteName: "",
      logoUrl: "",
      faviconUrl: "",
      primaryColor: "",
      supportEmail: "",
      maintenanceMode: false,
    },
  });

  useEffect(() => {
    if (!settings) return;
    reset({
      siteName: settings.siteName ?? "",
      logoUrl: settings.logoUrl ?? "",
      faviconUrl: settings.faviconUrl ?? "",
      primaryColor: settings.primaryColor ?? "",
      supportEmail: settings.supportEmail ?? "",
      maintenanceMode: settings.maintenanceMode ?? false,
    });
  }, [settings, reset]);

  const onSubmit = async (values: Partial<Settings> & { maintenanceMode?: boolean }) => {
    await update.mutateAsync({
      siteName: values.siteName || undefined,
      logoUrl: values.logoUrl || undefined,
      faviconUrl: values.faviconUrl || undefined,
      primaryColor: values.primaryColor || undefined,
      supportEmail: values.supportEmail || undefined,
      maintenanceMode: values.maintenanceMode,
    });
  };

  if (isLoading || !settings) {
    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>Settings</Typography>
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>Settings</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Site settings and branding.</Typography>
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 560 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}>
            <TextField label="Site name" {...register("siteName")} fullWidth />
            <Controller
              name="logoUrl"
              control={control}
              render={({ field }) => (
                <ImageUploadField label="Logo" value={field.value ?? ""} onChange={field.onChange} previewAlt="Logo" />
              )}
            />
            <Controller
              name="faviconUrl"
              control={control}
              render={({ field }) => (
                <ImageUploadField label="Favicon" value={field.value ?? ""} onChange={field.onChange} previewAlt="Favicon" />
              )}
            />
            <TextField label="Primary color" {...register("primaryColor")} placeholder="#c62828" fullWidth />
            <TextField label="Support email" type="email" {...register("supportEmail")} fullWidth />
            <Controller
              name="maintenanceMode"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={!!field.value} />}
                  label="Maintenance mode"
                />
              )}
            />
            <Button type="submit" variant="contained" color="primary" disabled={update.isPending}>
              {update.isPending ? "Saving…" : "Save settings"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
