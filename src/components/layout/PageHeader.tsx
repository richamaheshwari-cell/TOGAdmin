"use client";

import { Box, Button, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "flex-start" },
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Box sx={{ flexShrink: 0 }}>{action}</Box>
      )}
    </Box>
  );
}
