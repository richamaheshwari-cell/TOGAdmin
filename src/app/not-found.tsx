"use client";

import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        p: 3,
        bgcolor: "background.default",
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        404 – Page not found
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        The page you’re looking for doesn’t exist or has been moved.
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button
          component={Link}
          href="/dashboard"
          variant="contained"
          color="primary"
        >
          Go to Dashboard
        </Button>
        <Button component={Link} href="/login" variant="outlined">
          Log in
        </Button>
      </Box>
    </Box>
  );
}
