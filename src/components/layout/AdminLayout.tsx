"use client";

import { useState } from "react";
import { Box } from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import { Sidebar } from "./Sidebar";
import { AppBar } from "./AppBar";
import { SIDEBAR_WIDTH_PX } from "./Sidebar";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flex: 1,
          width: "100%",
          minWidth: 0,
          mt: { xs: 7, sm: 8 },
          ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
          p: { xs: 2, sm: 3 },
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            mx: "auto",
            width: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
      <AppBar onMenuClick={() => setMobileOpen(true)} />
    </Box>
  );
}
