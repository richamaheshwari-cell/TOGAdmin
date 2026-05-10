"use client";

import {
  Box,
  Typography,
  Paper,
  Grid,
  Skeleton,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  useTheme,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import BusinessIcon from "@mui/icons-material/Business";
import ArticleIcon from "@mui/icons-material/Article";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import EmailIcon from "@mui/icons-material/Email";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboard } from "@/hooks/useDashboard";
import { useMe } from "@/hooks/useMe";
import { STATUS_LABELS, ROLE_LABELS, DASHBOARD_TYPE_LABELS } from "@/lib/constants";
import type { DashboardResponse, DashboardAdminResponse } from "@/lib/types";
import { isAdminDashboard } from "@/lib/types";
import NextLink from "next/link";

const CARD_ICON_COLORS = [
  "#1976d2", "#c62828", "#e65100", "#2e7d32", "#0288d1", "#7b1fa2", "#00838f", "#f9a825", "#5c6bc0", "#00acc1",
];

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return diffMins <= 1 ? "1 min ago" : `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}

function StatusChip({ status }: { status: string }) {
  const color =
    status === "published" ? "success"
    : status === "pending" ? "warning"
    : "default";
  return (
    <Chip
      label={STATUS_LABELS[status] ?? status}
      size="small"
      color={color}
      sx={{
        fontWeight: 500,
        ...(status === "draft" && { bgcolor: "grey.200", color: "grey.700" }),
      }}
    />
  );
}

function RoleChip({ role }: { role: string }) {
  const color =
    role === "super_admin" || role === "admin" ? "error"
    : role === "seo_editor" ? "success"
    : "default";
  const label = ROLE_LABELS[role] ?? role;
  return (
    <Chip label={label} size="small" color={color} sx={{ fontWeight: 500, textTransform: "capitalize" }} variant="outlined" />
  );
}

function StatusCountBadge({ count, variant }: { count: number; variant: "draft" | "pending" | "published" }) {
  const color =
    variant === "published" ? "success.light"
    : variant === "pending" ? "warning.light"
    : "grey.200";
  const textColor = variant === "draft" ? "grey.700" : variant === "pending" ? "warning.dark" : "success.dark";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 28,
        height: 24,
        px: 1,
        borderRadius: 2,
        bgcolor: color,
        color: textColor,
        fontSize: "0.8125rem",
        fontWeight: 600,
      }}
    >
      {count}
    </Box>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboard();
  const { data: me } = useMe();
  const theme = useTheme();
  const isAdmin = isAdminDashboard(data as DashboardResponse);
  const adminData = data as DashboardAdminResponse | undefined;

  if (error) {
    return (
      <Box sx={{ width: "100%", minWidth: 0, p: 2 }}>
        <Typography color="error">Failed to load dashboard data.</Typography>
      </Box>
    );
  }

  const title = isAdmin ? "Admin Dashboard" : "Editor Dashboard";
  const subtitle = isAdmin ? "Global overview of all content and activity" : "Your personal content workspace";

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          {title}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {subtitle}
        </Typography>
      </Box>

      {isLoading ? (
        <DashboardSkeleton isAdmin={!!user && (user.role === "super_admin" || user.role === "admin")} />
      ) : (
        <Grid container spacing={2.5}>
          {isAdmin && adminData?.globalTotals && (
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {[
                  { key: "pages", label: "Pages", icon: DescriptionIcon },
                  { key: "casinos", label: "Casinos", icon: BusinessIcon },
                  { key: "casinoArticles", label: "Casino Articles", icon: ArticleIcon },
                  { key: "games", label: "Games", icon: SportsEsportsIcon },
                  { key: "gameArticles", label: "Game Articles", icon: ArticleIcon },
                  { key: "blogs", label: "Blogs", icon: MenuBookIcon },
                  { key: "news", label: "News", icon: NewspaperIcon },
                  { key: "bonuses", label: "Bonuses", icon: CardGiftcardIcon },
                  { key: "bonusArticles", label: "Bonus Articles", icon: ArticleIcon },
                  { key: "subscribers", label: "Subscribers", icon: EmailIcon },
                ].map((item, i) => {
                  const count =
                    item.key === "subscribers"
                      ? adminData.subscribersCount ?? adminData.globalTotals?.subscribers ?? 0
                      : (adminData.globalTotals as Record<string, number>)?.[item.key] ?? 0;
                  const Icon = item.icon;
                  const color = CARD_ICON_COLORS[i % CARD_ICON_COLORS.length];
                  return (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={item.key}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          height: "100%",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          transition: "box-shadow 0.2s, border-color 0.2s",
                          "&:hover": { boxShadow: 1, borderColor: "primary.light" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: `${color}18`,
                            color,
                          }}
                        >
                          <Icon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {typeof count === "number" ? count.toLocaleString("en-US") : count}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {item.label}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          )}

          {!isAdmin && me?.stats && (
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {[
                  { key: "pagesCreated", label: "Pages", icon: DescriptionIcon },
                  { key: "casinosCreated", label: "Casinos", icon: BusinessIcon },
                  { key: "casinoArticlesCreated", label: "Casino Articles", icon: ArticleIcon },
                  { key: "gamesCreated", label: "Games", icon: SportsEsportsIcon },
                  { key: "gameArticlesCreated", label: "Game Articles", icon: ArticleIcon },
                  { key: "blogsCreated", label: "Blogs", icon: MenuBookIcon },
                  { key: "newsCreated", label: "News", icon: NewspaperIcon },
                  { key: "bonusesCreated", label: "Bonuses", icon: CardGiftcardIcon },
                  { key: "bonusArticlesCreated", label: "Bonus Articles", icon: ArticleIcon },
                ].map((item, i) => {
                  const count = (me.stats ? (me.stats as unknown as Record<string, number>)[item.key] : 0) ?? 0;
                  const Icon = item.icon;
                  const color = CARD_ICON_COLORS[i % CARD_ICON_COLORS.length];
                  return (
                    <Grid item xs={6} sm={4} md={3} key={item.key}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          height: "100%",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          transition: "box-shadow 0.2s, border-color 0.2s",
                          "&:hover": { boxShadow: 1, borderColor: "primary.light" },
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: `${color}18`,
                            color,
                          }}
                        >
                          <Icon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                            {typeof count === "number" ? count.toLocaleString("en-US") : count}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {item.label}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          )}

          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                height: 500,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                {isAdmin ? "Global Status Summary" : "My Work Queue"}
              </Typography>
              <TableContainer>
                <Table size="small" sx={{ "& td, & th": { border: "none", py: 1 } }}>
                  <TableHead>
                    <TableRow sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Draft</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Pending</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Published</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(isAdmin ? adminData?.globalStatusSummary : data?.myStatusSummary)?.map((row) => (
                      <TableRow key={row.type} sx={{ borderBottom: 1, borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
                        <TableCell>{row.label}</TableCell>
                        <TableCell align="right"><StatusCountBadge count={row.draft} variant="draft" /></TableCell>
                        <TableCell align="right"><StatusCountBadge count={row.pending} variant="pending" /></TableCell>
                        <TableCell align="right"><StatusCountBadge count={row.published} variant="published" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Recent Activity - fixed height same as left, content scrolls */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                height: 500,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexShrink: 0 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {isAdmin ? "Recent Activity" : "My Recent Updates"}
                </Typography>
                <Link component={NextLink} href="/blogs" color="primary" underline="hover" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                  View All
                </Link>
              </Box>
              <TableContainer
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: "auto",
                  "& .MuiTable-root": { mb: 0 },
                  "& .MuiTableBody-root .MuiTableRow-root:last-child td": { borderBottom: "none", pb: 0 },
                }}
              >
                <Table size="small" stickyHeader sx={{ "& td, & th": { py: 1.25 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>When</TableCell>
                      {isAdmin && <TableCell sx={{ fontWeight: 600 }}>By</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(data?.recentUpdated ?? []).slice(0, 10).map((item) => (
                      <TableRow key={`${item.type}-${item.id}`} hover>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography variant="body2" noWrap title={item.title}>
                            {item.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {DASHBOARD_TYPE_LABELS[item.type] ?? item.type}
                          </Typography>
                        </TableCell>
                        <TableCell><StatusChip status={item.status} /></TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" suppressHydrationWarning>
                            {formatRelativeTime(item.updatedAt)}
                          </Typography>
                        </TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {item.updatedBy?.name ?? item.updatedBy?.email ?? "—"}
                            </Typography>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {(!data?.recentUpdated || data.recentUpdated.length === 0) && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  No recent activity
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} lg={isAdmin ? 8 : 12}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                height: "100%",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                {isAdmin ? "Most Active Users" : "Editors Directory"}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {(data?.editorsDirectory ?? []).slice(0, 6).map((editor, idx) => {
                  const initials = (editor.name ?? editor.email).slice(0, 2).toUpperCase();
                  return (
                    <Box
                      key={editor.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        px: 1,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      {idx < 3 && isAdmin ? (
                        <Box sx={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <EmojiEventsIcon
                            sx={{
                              fontSize: 28,
                              color: idx === 0 ? "#ffc107" : idx === 1 ? "#9e9e9e" : "#cd7f32",
                            }}
                          />
                        </Box>
                      ) : (
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: "0.75rem",
                            bgcolor: theme.palette.primary.main,
                            color: "primary.contrastText",
                          }}
                        >
                          {initials}
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {editor.name ?? editor.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {editor.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                        <RoleChip role={editor.role} />
                        {editor.postCount != null && isAdmin && (
                          <Typography variant="body2" fontWeight={600} color="text.secondary">
                            {editor.postCount} posts
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          {isAdmin && (
            <Grid item xs={12} lg={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                  Recent Admin Logins
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {(adminData?.recentLogins ?? []).slice(0, 6).map((login) => {
                    const initials = (login.name ?? login.email).slice(0, 2).toUpperCase();
                    return (
                      <Box
                        key={login.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          px: 1,
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            fontSize: "0.75rem",
                            bgcolor: theme.palette.primary.main,
                            color: "primary.contrastText",
                          }}
                        >
                          {initials}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {login.name ?? login.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {login.email}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" flexShrink={0} suppressHydrationWarning>
                          {formatRelativeTime(login.lastLoginAt)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
                {(!adminData?.recentLogins || adminData.recentLogins.length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
                    No recent logins
                  </Typography>
                )}
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}

function DashboardSkeleton({ isAdmin }: { isAdmin: boolean }) {
  const cardCount = isAdmin ? 10 : 9;
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          {[...Array(cardCount)].map((_, i) => (
            <Grid item xs={6} sm={4} md={3} lg={isAdmin ? 2 : 3} key={i}>
              <Skeleton variant="rounded" height={80} />
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Skeleton variant="rounded" height={320} />
      </Grid>
      <Grid item xs={12} lg={6}>
        <Skeleton variant="rounded" height={320} />
      </Grid>
      <Grid item xs={12} lg={isAdmin ? 8 : 12}>
        <Skeleton variant="rounded" height={280} />
      </Grid>
      {isAdmin && (
        <Grid item xs={12} lg={4}>
          <Skeleton variant="rounded" height={280} />
        </Grid>
      )}
    </Grid>
  );
}
