"use client";

import { AppBar as MuiAppBar, Avatar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "@/contexts/AuthContext";
import { SIDEBAR_WIDTH_PX } from "./Sidebar";
import { useTheme, useMediaQuery } from "@mui/material";

interface AppBarProps {
  onMenuClick: () => void;
}

export function AppBar({ onMenuClick }: AppBarProps) {
  const { user } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        width: isDesktop ? `calc(100% - ${SIDEBAR_WIDTH_PX}px)` : "100%",
        ml: isDesktop ? `${SIDEBAR_WIDTH_PX}px` : 0,
        bgcolor: "background.paper",
        color: "text.primary",
        boxShadow: "none",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 64 },
          justifyContent: "space-between",
          px: { xs: 1, sm: 2 },
        }}
      >
        <IconButton
          color="inherit"
          aria-label="Open menu"
          onClick={onMenuClick}
          sx={{ display: { xs: "block", md: "none" }, mr: 1 }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 }, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ display: { xs: "none", sm: "block" }, maxWidth: 120 }}>
            {user?.name ?? "Admin"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap sx={{ display: { xs: "none", md: "block" }, maxWidth: 160 }}>
            {user?.email}
          </Typography>
          <Avatar sx={{ width: 36, height: 36, flexShrink: 0, bgcolor: "primary.main" }}>
            {(user?.name ?? user?.email ?? "A").charAt(0).toUpperCase()}
          </Avatar>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
