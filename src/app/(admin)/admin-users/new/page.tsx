"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Paper, TextField, Typography, MenuItem } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { useCreateAdminUser } from "@/hooks/useAdminUsers";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS } from "@/lib/constants";
import { getDisplayErrorMessage } from "@/lib/errorUtils";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Min 8 characters"),
  role: z.enum(["admin", "editor", "seo_editor"]),
  name: z.string().optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function NewAdminUserPage() {
  const router = useRouter();
  const { user } = useAuth();
  const create = useCreateAdminUser();
  const isSuperAdmin = user?.role === "super_admin";
  const roleOptions = isSuperAdmin
    ? ([{ value: "admin", label: ROLE_LABELS.admin }, { value: "editor", label: ROLE_LABELS.editor }, { value: "seo_editor", label: ROLE_LABELS.seo_editor }] as const)
    : ([{ value: "editor", label: ROLE_LABELS.editor }, { value: "seo_editor", label: ROLE_LABELS.seo_editor }] as const);

  const { register, control, handleSubmit, setError, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", role: "editor", name: "", isActive: true },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await create.mutateAsync({
        email: values.email,
        password: values.password,
        role: values.role,
        name: values.name || undefined,
        isActive: values.isActive,
      });
      router.push("/admin-users");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "EMAIL_EXISTS") setError("email", { message: "This email is already in use" });
      else setError("root", { message: getDisplayErrorMessage(err, "Failed to create user") });
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Button startIcon={<ArrowBackIcon />} component={Link} href="/admin-users" sx={{ mb: 2 }}>Back to Admin Users</Button>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>Add Admin User</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Create a new admin account.</Typography>
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 440 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {errors.root && <Typography color="error" sx={{ mb: 2 }}>{errors.root.message}</Typography>}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
            <TextField label="Email" type="email" {...register("email")} error={!!errors.email} helperText={errors.email?.message} fullWidth required />
            <TextField label="Password" type="password" {...register("password")} error={!!errors.password} helperText={errors.password?.message} fullWidth required inputProps={{ minLength: 8 }} />
            <TextField select label="Role" {...register("role")} fullWidth required>
              {roleOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </TextField>
            <TextField label="Name" {...register("name")} fullWidth />
            <Controller name="isActive" control={control} render={({ field }) => <FormControlLabel control={<Checkbox {...field} checked={!!field.value} />} label="Active" />} />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button type="submit" variant="contained" color="primary" disabled={create.isPending}>Create User</Button>
              <Button component={Link} href="/admin-users">Cancel</Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
