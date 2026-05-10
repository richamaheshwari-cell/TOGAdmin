"use client";

import { useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  Skeleton,
  Alert,
  Grid,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useForm, Controller } from "react-hook-form";
import { useMe, useUpdateMe, type UpdateMeBody } from "@/hooks/useMe";
import { ImageUploadField } from "@/components/forms/ImageUploadField";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/lib/constants";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import type { AuthUser } from "@/lib/types";

interface ProfileFormValues {
  name: string;
  bio: string;
  avatarUrl: string;
  profilePublic: boolean;
  showEmailPublicly: boolean;
}

const PROFILE_TIPS = [
  "Use a professional photo for better credibility",
  "Write a compelling bio to engage readers",
  "Keep your profile public to build your author brand",
];

function StatRow({ label, count }: { label: string; count: number }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box
        component="span"
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: "50%",
          minWidth: 24,
          height: 24,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        {count}
      </Box>
    </Box>
  );
}

export default function ProfilePage() {
  const { data: me, isLoading, error } = useMe();
  const updateMe = useUpdateMe();
  const { user: authUser, setUser } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: "",
      bio: "",
      avatarUrl: "",
      profilePublic: false,
      showEmailPublicly: false,
    },
  });

  useEffect(() => {
    if (!me) return;
    reset({
      name: me.name ?? "",
      bio: me.bio ?? "",
      avatarUrl: me.avatarUrl ?? "",
      profilePublic: me.profilePublic ?? false,
      showEmailPublicly: me.showEmailPublicly ?? false,
    });
  }, [me, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    const body: UpdateMeBody = {
      name: values.name || undefined,
      bio: values.bio || undefined,
      avatarUrl: values.avatarUrl || undefined,
      profilePublic: values.profilePublic,
      showEmailPublicly: values.showEmailPublicly,
    };
    try {
      const updated = await updateMe.mutateAsync(body);
      setUser({
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        mustChangePassword: updated.mustChangePassword,
        isSystem: (authUser as AuthUser)?.isSystem ?? false,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl,
      } as AuthUser);
    } catch {
      // Error shown via updateMe.isError
    }
  };

  if (isLoading || !me) {
    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          My Profile
        </Typography>
        <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          My Profile
        </Typography>
        <Alert severity="error">Failed to load profile. Please try again.</Alert>
      </Box>
    );
  }

  const avatarUrl = watch("avatarUrl") || me.avatarUrl || "";

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
        My Profile
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your publisher profile (name, bio, avatar) is shown on content you create. Control visibility settings below.
      </Typography>

      <Grid container spacing={3}>
        {/* Left column: form */}
        <Grid item xs={12} md={7}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {updateMe.isError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {getDisplayErrorMessage(updateMe.error, "Failed to update profile")}
                {(updateMe.error as unknown as { details?: unknown })?.details != null && (
                  <Typography component="span" display="block" variant="body2" sx={{ mt: 1 }}>
                    {JSON.stringify((updateMe.error as unknown as { details: unknown }).details)}
                  </Typography>
                )}
              </Alert>
            )}

            {/* Account Information */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Account Information
              </Typography>
              <TextField
                fullWidth
                label="Email"
                value={me.email}
                disabled
                size="small"
                sx={{ mb: 2 }}
                helperText="Email cannot be changed here."
              />
              <TextField
                fullWidth
                label="Role"
                value={ROLE_LABELS[me.role] ?? me.role}
                disabled
                size="small"
                sx={{ mb: 2 }}
              />
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Display Name"
                    {...field}
                    size="small"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={{ mb: 2 }}
                    placeholder="Shown on articles and casinos you create"
                  />
                )}
              />
              <Controller
                name="bio"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Bio"
                    {...field}
                    multiline
                    rows={3}
                    size="small"
                    error={!!errors.bio}
                    helperText={errors.bio?.message}
                    placeholder="Short bio for your public profile"
                  />
                )}
              />
            </Paper>

            {/* Profile Image */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Profile Image
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-start" }}>
                {avatarUrl ? (
                  <Box
                    component="img"
                    src={avatarUrl}
                    alt="Profile"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "action.hover",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "action.hover",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h4" color="text.secondary">
                      {(me.name || me.email || "?").charAt(0).toUpperCase()}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Controller
                    name="avatarUrl"
                    control={control}
                    render={({ field }) => (
                      <ImageUploadField
                        label="Image URL"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        previewAlt="Profile"
                        helperText="JPEG, PNG, GIF, WebP (max 5MB)"
                      />
                    )}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Visibility Settings */}
            <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Visibility Settings
              </Typography>
              <Controller
                name="profilePublic"
                control={control}
                render={({ field }) => (
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={<Switch {...field} checked={!!field.value} color="primary" />}
                      label="Public Profile"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, pl: 0 }}>
                      When enabled, visitors can view your profile page (e.g. when clicking your name on an article). When disabled, the profile page returns 404.
                    </Typography>
                  </Box>
                )}
              />
              <Controller
                name="showEmailPublicly"
                control={control}
                render={({ field }) => (
                  <Box>
                    <FormControlLabel
                      control={<Switch {...field} checked={!!field.value} color="primary" />}
                      label="Show Email Publicly"
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, pl: 0 }}>
                      When enabled, your email is shown in bylines and on your public profile page.
                    </Typography>
                  </Box>
                )}
              />
            </Paper>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={updateMe.isPending}
              >
                {updateMe.isPending ? "Saving…" : "Save Profile"}
              </Button>
              <Button
                type="button"
                variant="outlined"
                onClick={() =>
                  reset({
                    name: me.name ?? "",
                    bio: me.bio ?? "",
                    avatarUrl: me.avatarUrl ?? "",
                    profilePublic: me.profilePublic ?? false,
                    showEmailPublicly: me.showEmailPublicly ?? false,
                  })
                }
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Grid>

        {/* Right column: stats, tips, status */}
        <Grid item xs={12} md={5}>
          {/* Content Created */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Content Created
            </Typography>
            <StatRow label="Pages" count={me.stats?.pagesCreated ?? 0} />
            <StatRow label="Casinos" count={me.stats?.casinosCreated ?? 0} />
            <StatRow label="Casino Articles" count={me.stats?.casinoArticlesCreated ?? 0} />
            <StatRow label="Games" count={me.stats?.gamesCreated ?? 0} />
            <StatRow label="Game Articles" count={me.stats?.gameArticlesCreated ?? 0} />
            <StatRow label="Blogs" count={me.stats?.blogsCreated ?? 0} />
            <StatRow label="News" count={me.stats?.newsCreated ?? 0} />
            <StatRow label="Bonuses" count={me.stats?.bonusesCreated ?? 0} />
            <StatRow label="Bonus Articles" count={me.stats?.bonusArticlesCreated ?? 0} />
          </Paper>

          {/* Profile Tips */}
          <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LightbulbIcon color="action" fontSize="small" />
              Profile Tips
            </Typography>
            {PROFILE_TIPS.map((tip, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1, py: 0.5 }}>
                <CheckCircleIcon sx={{ color: "success.main", fontSize: 20, mt: 0.25 }} />
                <Typography variant="body2" color="text.secondary">
                  {tip}
                </Typography>
              </Box>
            ))}
          </Paper>

          {/* Account Status */}
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CheckCircleIcon sx={{ color: "success.main", fontSize: 22 }} />
              Account Status
            </Typography>
            <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600, mb: 1 }}>
              Active & Verified
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since: {me.createdAt ? new Date(me.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last login: {me.lastLoginAt ? new Date(me.lastLoginAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" }) : "—"}
            </Typography>
            {me.createdBy && (
              <Typography variant="body2" color="text.secondary">
                Created by: {me.createdBy.name ?? me.createdBy.email}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
