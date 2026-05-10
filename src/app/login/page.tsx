"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import Link from "next/link";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CasinoIcon from "@mui/icons-material/Casino";
import { useAuth } from "@/contexts/AuthContext";
import { getDisplayErrorMessage } from "@/lib/errorUtils";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const { login, accessToken, isInitialized } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isInitialized && accessToken) {
    router.replace(redirect);
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace(redirect);
    } catch (err) {
      setError(getDisplayErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

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
              TheOceanGames Admin
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Sign in with your admin account.
          </Typography>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                      aria-label="toggle password"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1 }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button component={Link} href="/login/forgot-password" size="small" sx={{ textTransform: "none" }}>
                Forgot password?
              </Button>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
