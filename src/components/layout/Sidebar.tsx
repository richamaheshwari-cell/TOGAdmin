"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Box,
  Collapse,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CasinoIcon from "@mui/icons-material/Casino";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import WebIcon from "@mui/icons-material/Web";
import ArticleIcon from "@mui/icons-material/Article";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import SettingsIcon from "@mui/icons-material/Settings";
import CampaignIcon from "@mui/icons-material/Campaign";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";

const SIDEBAR_WIDTH = 260;

const navItemSx = (active: boolean) => ({
  mx: 1,
  borderRadius: 1,
  borderLeft: active ? 3 : 0,
  borderColor: "primary.main",
  bgcolor: active ? "action.selected" : "transparent",
  "&.Mui-selected": {
    bgcolor: "action.selected",
    color: "primary.main",
    "& .MuiListItemIcon-root": { color: "primary.main" },
  },
});

const subItemSx = (active: boolean) => ({
  ...navItemSx(active),
  pl: 4,
});

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const setNavigating = useNavigation();
  const canAccessAdminUsers = user?.role === "super_admin" || user?.role === "admin";
  const canReassign = user?.role === "super_admin" || user?.role === "admin";

  const [casinoExpanded, setCasinoExpanded] = useState(() => pathname.startsWith("/casinos") || pathname.startsWith("/casino-articles"));
  const [gamesExpanded, setGamesExpanded] = useState(() => pathname.startsWith("/games") || pathname.startsWith("/game-articles"));
  const [bonusExpanded, setBonusExpanded] = useState(() => pathname.startsWith("/bonuses") || pathname.startsWith("/bonus-articles"));
  useEffect(() => {
    if (pathname.startsWith("/casinos") || pathname.startsWith("/casino-articles")) setCasinoExpanded(true);
    if (pathname.startsWith("/games") || pathname.startsWith("/game-articles")) setGamesExpanded(true);
    if (pathname.startsWith("/bonuses") || pathname.startsWith("/bonus-articles")) setBonusExpanded(true);
  }, [pathname]);

  const onLinkClick = useCallback(() => {
    setNavigating(true);
    onNavigate?.();
  }, [setNavigating, onNavigate]);

  return (
    <>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
          <CasinoIcon color="primary" />
          TheOceanGames
        </Typography>
      </Box>
      <List sx={{ flex: 1, py: 1, px: 0, overflow: "auto" }}>
        <ListItemButton href="/dashboard" component={Link} prefetch={false} selected={pathname === "/dashboard" || pathname.startsWith("/dashboard/")} onClick={onLinkClick} sx={navItemSx(pathname === "/dashboard" || pathname.startsWith("/dashboard/"))}>
          <ListItemIcon sx={{ minWidth: 40 }}><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton onClick={() => setCasinoExpanded((o) => !o)} sx={{ mx: 1, borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><CasinoIcon /></ListItemIcon>
          <ListItemText primary="Casino" />
          {casinoExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={casinoExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} href="/casinos" prefetch={false} selected={pathname === "/casinos" || pathname.startsWith("/casinos/")} onClick={onLinkClick} sx={subItemSx(pathname === "/casinos" || pathname.startsWith("/casinos/"))}>
              <ListItemIcon sx={{ minWidth: 36 }}><CasinoIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Casinos" />
            </ListItemButton>
            <ListItemButton component={Link} href="/casino-articles" prefetch={false} selected={pathname === "/casino-articles" || pathname.startsWith("/casino-articles/")} onClick={onLinkClick} sx={subItemSx(pathname === "/casino-articles" || pathname.startsWith("/casino-articles/"))}>
              <ListItemIcon sx={{ minWidth: 36 }}><ArticleIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Casino Articles" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton onClick={() => setGamesExpanded((o) => !o)} sx={{ mx: 1, borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><SportsEsportsIcon /></ListItemIcon>
          <ListItemText primary="Games" />
          {gamesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={gamesExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} href="/games" prefetch={false} selected={pathname === "/games" || pathname.startsWith("/games/")} onClick={onLinkClick} sx={subItemSx(pathname === "/games" || pathname.startsWith("/games/"))}>
              <ListItemIcon sx={{ minWidth: 36 }}><SportsEsportsIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Games" />
            </ListItemButton>
            <ListItemButton component={Link} href="/game-articles" prefetch={false} selected={pathname === "/game-articles" || pathname.startsWith("/game-articles/")} onClick={onLinkClick} sx={subItemSx(pathname === "/game-articles" || pathname.startsWith("/game-articles/"))}>
              <ListItemIcon sx={{ minWidth: 36 }}><ArticleIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Game Articles" />
            </ListItemButton>
          </List>
        </Collapse>

        <ListItemButton href="/cms" component={Link} prefetch={false} selected={pathname === "/cms" || pathname.startsWith("/cms/")} onClick={onLinkClick} sx={navItemSx(pathname === "/cms" || pathname.startsWith("/cms/"))}>
          <ListItemIcon sx={{ minWidth: 40 }}><WebIcon /></ListItemIcon>
          <ListItemText primary="Pages (CMS)" />
        </ListItemButton>
        <ListItemButton href="/blogs" component={Link} prefetch={false} selected={pathname === "/blogs" || pathname.startsWith("/blogs/")} onClick={onLinkClick} sx={navItemSx(pathname === "/blogs" || pathname.startsWith("/blogs/"))}>
          <ListItemIcon sx={{ minWidth: 40 }}><MenuBookIcon /></ListItemIcon>
          <ListItemText primary="Blogs" />
        </ListItemButton>
        <ListItemButton href="/news" component={Link} prefetch={false} selected={pathname === "/news" || pathname.startsWith("/news/")} onClick={onLinkClick} sx={navItemSx(pathname === "/news" || pathname.startsWith("/news/"))}>
          <ListItemIcon sx={{ minWidth: 40 }}><NewReleasesIcon /></ListItemIcon>
          <ListItemText primary="News & Updates" />
        </ListItemButton>
        <ListItemButton onClick={() => setBonusExpanded((o) => !o)} sx={{ mx: 1, borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><CardGiftcardIcon /></ListItemIcon>
          <ListItemText primary="Bonus" />
          {bonusExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        <Collapse in={bonusExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton component={Link} href="/bonuses" prefetch={false} selected={pathname === "/bonuses" || pathname.startsWith("/bonuses/")} onClick={onLinkClick} sx={subItemSx(pathname === "/bonuses" || pathname.startsWith("/bonuses/"))}>
              <ListItemIcon sx={{ minWidth: 36 }}><CardGiftcardIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Bonuses" />
            </ListItemButton>
            <ListItemButton component={Link} href="/bonus-articles" prefetch={false} selected={pathname === "/bonus-articles" || pathname.startsWith("/bonus-articles/")} onClick={onLinkClick} sx={subItemSx(pathname === "/bonus-articles" || pathname.startsWith("/bonus-articles/"))}>
              <ListItemIcon sx={{ minWidth: 36 }}><ArticleIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary="Bonus Articles" />
            </ListItemButton>
          </List>
        </Collapse>
        <ListItemButton href="/settings" component={Link} prefetch={false} selected={pathname === "/settings"} onClick={onLinkClick} sx={navItemSx(pathname === "/settings")}>
          <ListItemIcon sx={{ minWidth: 40 }}><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
        <ListItemButton href="/newsletter" component={Link} prefetch={false} selected={pathname === "/newsletter"} onClick={onLinkClick} sx={navItemSx(pathname === "/newsletter")}>
          <ListItemIcon sx={{ minWidth: 40 }}><CampaignIcon /></ListItemIcon>
          <ListItemText primary="Newsletter" />
        </ListItemButton>
        <ListItemButton component={Link} href="/profile" prefetch={false} selected={pathname === "/profile"} onClick={onLinkClick} sx={navItemSx(pathname === "/profile")}>
          <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon /></ListItemIcon>
          <ListItemText primary="My profile" />
        </ListItemButton>
        {canReassign && (
          <ListItemButton component={Link} href="/reassign" prefetch={false} selected={pathname.startsWith("/reassign")} onClick={onLinkClick} sx={navItemSx(pathname.startsWith("/reassign"))}>
            <ListItemIcon sx={{ minWidth: 40 }}><SwapHorizIcon /></ListItemIcon>
            <ListItemText primary="Reassign content" />
          </ListItemButton>
        )}
        {canAccessAdminUsers && (
          <ListItemButton component={Link} href="/admin-users" prefetch={false} selected={pathname.startsWith("/admin-users")} onClick={onLinkClick} sx={navItemSx(pathname.startsWith("/admin-users"))}>
            <ListItemIcon sx={{ minWidth: 40 }}><PeopleIcon /></ListItemIcon>
            <ListItemText primary="Admin Users" />
          </ListItemButton>
        )}
      </List>
      <Box sx={{ p: 1, borderTop: 1, borderColor: "divider" }}>
        <ListItemButton onClick={() => { onNavigate?.(); logout(); }} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    </>
  );
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const content = <SidebarContent onNavigate={isDesktop ? undefined : onMobileClose} />;

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            top: 0,
            left: 0,
            height: "100%",
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
          {content}
        </Box>
      </Drawer>
      {/* Desktop permanent sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          flexDirection: "column",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: theme.zIndex.drawer - 1,
          borderRight: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {content}
      </Box>
    </>
  );
}

export const SIDEBAR_WIDTH_PX = SIDEBAR_WIDTH;
