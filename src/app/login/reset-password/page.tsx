"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CasinoIcon from "@mui/icons-material/Casino";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { api } from "@/lib/api";
import { getDisplayErrorMessage } from "@/lib/errorUtils";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!token) {
      setError("Missing reset link. Use the link from your email.");
      return;
    }
    setLoading(true);
    try {
      await api.post<{ ok?: boolean }>("/admin/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err) {
      const msg = getDisplayErrorMessage(err, "Reset failed");
      const code = (err as Error & { code?: string }).code;
      setError(code === "INVALID_TOKEN" ? "This link is invalid, expired, or already used. Request a new reset link." : msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: { xs: 2, sm: 3 },
          boxSizing: "border-box",
        }}
      >
        <Card sx={{ maxWidth: 400, width: "100%", boxSizing: "border-box" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <CasinoIcon color="primary" sx={{ fontSize: 28 }} />
              <Typography variant="h5" fontWeight={700}>
                Invalid link
              </Typography>
            </Box>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This reset link is missing the token. Use the link from your password reset email, or request a new one.
            </Alert>
            <Button component={Link} href="/login/forgot-password" variant="contained" fullWidth>
              Request reset link
            </Button>
            <Button component={Link} href="/login" sx={{ mt: 2 }} fullWidth startIcon={<ArrowBackIcon />}>
              Back to login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          p: { xs: 2, sm: 3 },
          boxSizing: "border-box",
        }}
      >
        <Card sx={{ maxWidth: 400, width: "100%", boxSizing: "border-box" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Alert severity="success">Password updated. Redirecting to login…</Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: { xs: 2, sm: 3 },
        boxSizing: "border-box",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", boxSizing: "border-box" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
            <CasinoIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
              Set new password
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Enter your new password below.
          </Typography>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="New password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((p) => !p)} edge="end" aria-label="toggle password">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm new password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Update password"}
            </Button>
          </form>
          <Button component={Link} href="/login" sx={{ mt: 2 }} startIcon={<ArrowBackIcon />} size="small">
            Back to login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
          }}
        >
          <CircularProgress />
        </Box>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
