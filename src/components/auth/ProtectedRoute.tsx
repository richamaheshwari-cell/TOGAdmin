"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, accessToken, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized) return;
    if (!accessToken || !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [isInitialized, accessToken, user, allowedRoles, router, pathname]);

  if (!isInitialized) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!accessToken || !user) {
    return null;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Typography color="text.secondary">You don&apos;t have permission to view this page.</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
