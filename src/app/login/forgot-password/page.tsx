"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import CasinoIcon from "@mui/icons-material/Casino";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { api } from "@/lib/api";
import { getDisplayErrorMessage } from "@/lib/errorUtils";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post<{ ok?: boolean }>("/admin/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(getDisplayErrorMessage(err, "Request failed"));
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
              Reset password
            </Typography>
          </Box>
          {sent ? (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                If an account exists for that email, we&apos;ve sent a reset link. Check your inbox and use the link to set a new password.
              </Alert>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button component={Link} href="/login" variant="outlined" fullWidth startIcon={<ArrowBackIcon />}>
                  Back to login
                </Button>
                <Button variant="text" fullWidth size="small" onClick={() => { setSent(false); setError(""); }}>
                  Send another link
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Enter your admin email and we&apos;ll send a password reset link.
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
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Send reset link"}
                </Button>
              </form>
              <Button component={Link} href="/login" sx={{ mt: 2 }} startIcon={<ArrowBackIcon />} size="small">
                Back to login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
