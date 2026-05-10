"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  Chip,
  Paper,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Link from "next/link";
import { useGamesList, useDeleteGame } from "@/hooks/useGames";
import { useAuth } from "@/contexts/AuthContext";
import type { Game, CasinoStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataGridContainer } from "@/components/layout/DataGridContainer";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

const PAGE_SIZE = 10;

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { timeZone: "UTC" });
}

export default function GamesPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useGamesList({
    page: page + 1,
    limit: PAGE_SIZE,
    status: status || undefined,
    q: search || undefined,
  });

  const deleteGame = useDeleteGame();
  const { user } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteClick = useCallback((game: Game) => {
    setDeleteConfirm({ id: game.id, title: game.title });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    deleteGame.mutate(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) });
  }, [deleteConfirm, deleteGame]);

  const canEdit = (game: Game) => {
    if (user?.role === "super_admin" || user?.role === "admin") return true;
    return game.createdBy?.id === user?.id;
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Game",
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {params.row.featureImg ? (
            <Box
              component="img"
              src={params.row.featureImg}
              alt=""
              sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover" }}
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" color="text.secondary">—</Typography>
            </Box>
          )}
          <Box>
            <Typography variant="body2" fontWeight={500}>{params.row.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.tag ?? params.row.slug}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "casinos",
      headerName: "Casinos",
      flex: 0.8,
      minWidth: 160,
      sortable: false,
      renderCell: (params) => {
        const list = params.row.casinos as { casinoName: string; slug: string }[] | undefined;
        if (!list?.length) return <Typography variant="body2" color="text.secondary">—</Typography>;
        return (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, py: 0.5 }}>
            {list.slice(0, 3).map((c) => (
              <Chip key={c.slug} label={c.casinoName} size="small" variant="outlined" component={Link} href={`/casinos/${c.slug}`} clickable />
            ))}
            {list.length > 3 && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                +{list.length - 3}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      field: "tag",
      headerName: "Tag",
      width: 120,
      renderCell: (params) => (params.value ? <Chip label={params.value} size="small" variant="outlined" /> : "—"),
    },
    {
      field: "gameProvider",
      headerName: "Providers",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" noWrap title={(params.value as string[])?.join(", ")}>
          {(params.value as string[])?.length ? `${(params.value as string[]).length} provider(s)` : "—"}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={STATUS_LABELS[params.row.status] ?? params.row.status}
          size="small"
          color={params.row.status === "published" ? "success" : "default"}
          variant="outlined"
          sx={{
            ...(params.row.status === "published" && {
              bgcolor: "success.light",
              color: "success.dark",
              borderColor: "transparent",
            }),
          }}
        />
      ),
    },
    {
      field: "createdBy",
      headerName: "Created by",
      width: 120,
      renderCell: (params) => (params.value ? (params.value as { name?: string | null; email: string }).name ?? (params.value as { email: string }).email : "—"),
    },
    {
      field: "updatedAt",
      headerName: "Last updated",
      width: 130,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" suppressHydrationWarning>
          {formatRelativeTime(params.row.updatedAt)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" component={Link} href={`/games/${params.row.slug}`} aria-label="View">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {canEdit(params.row) && (
            <IconButton size="small" component={Link} href={`/games/${params.row.slug}/edit`} aria-label="Edit">
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canEdit(params.row) && (
            <IconButton size="small" color="error" onClick={() => handleDeleteClick(params.row)} aria-label="Delete" disabled={deleteGame.isPending}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const paginationModel: GridPaginationModel = { page, pageSize: PAGE_SIZE };
  const rowCount = data?.total ?? 0;

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader
        title="Games"
        subtitle="Manage game listings"
        action={
          <Button component={Link} href="/games/new" variant="contained" color="primary" startIcon={<AddIcon />} fullWidth={false}>
            Add Game
          </Button>
        }
      />

      <Paper sx={{ mb: 2, p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "action.active", mr: 0.5 }} fontSize="small" />,
          }}
          sx={{ minWidth: { xs: "100%", sm: 220 }, flex: { xs: "1 1 100%", sm: "0 0 auto" } }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 140 }, flex: { xs: "1 1 100%", sm: "0 0 auto" } }}
        >
          <MenuItem value="">All Status</MenuItem>
          {(["published", "draft", "pending"] as CasinoStatus[]).map((s) => (
            <MenuItem key={s} value={s}>{STATUS_LABELS[s]}</MenuItem>
          ))}
        </TextField>
      </Paper>

      <DataGridContainer>
        <DataGrid
          rows={data?.items ?? []}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPage(model.page)}
          rowCount={rowCount}
          pageSizeOptions={[PAGE_SIZE]}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover" },
            "& .MuiDataGrid-cell:focus": { outline: "none" },
            "& .MuiDataGrid-cell:focus-within": { outline: "none" },
          }}
        />
      </DataGridContainer>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        Showing {(page * PAGE_SIZE) + 1} to {Math.min((page + 1) * PAGE_SIZE, rowCount)} of {rowCount} results
      </Typography>
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete game"
        message={deleteConfirm ? `Delete "${deleteConfirm.title}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteGame.isPending}
      />
    </Box>
  );
}
