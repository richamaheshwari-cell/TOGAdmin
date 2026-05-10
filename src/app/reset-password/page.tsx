"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

/**
 * Email reset links point to /reset-password?token=...
 * This redirects to the actual reset form at /login/reset-password so the token is preserved.
 */
function Redirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    router.replace(`/login/reset-password${query}`);
  }, [router, token]);

  return (
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
  );
}

export default function ResetPasswordRedirectPage() {
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
      <Redirect />
    </Suspense>
  );
}
