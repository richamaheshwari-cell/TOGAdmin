"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const router = useRouter();
  const { accessToken, isInitialized } = useAuth();

  useEffect(() => {
    if (!isInitialized) return;
    if (accessToken) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isInitialized, accessToken, router]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >  
      <CircularProgress />
    </Box>
  );
}
