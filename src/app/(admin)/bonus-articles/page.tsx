"use client";

import { useState } from "react";
import { Box, Button, IconButton, Paper, TextField, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import Link from "next/link";
import MenuItem from "@mui/material/MenuItem";
import { useBonusArticlesList, useDeleteBonusArticle } from "@/hooks/useBonusArticles";
import { useBonusesList } from "@/hooks/useBonuses";
import { useAuth } from "@/contexts/AuthContext";
import type { BonusArticle } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataGridContainer } from "@/components/layout/DataGridContainer";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

const PAGE_SIZE = 10;

function canEdit(article: BonusArticle, userRole?: string, currentUserId?: string) {
  if (userRole === "super_admin" || userRole === "admin") return true;
  return article.createdBy?.id === currentUserId;
}

export default function BonusArticlesPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [bonusId, setBonusId] = useState<string>("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useBonusArticlesList({
    page: page + 1,
    limit: PAGE_SIZE,
    status: status || undefined,
    bonusId: bonusId || undefined,
    q: search || undefined,
  });
  const { data: bonusesData } = useBonusesList({ limit: 500 });
  const deleteArticle = useDeleteBonusArticle();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteClick = (article: BonusArticle) => {
    setDeleteConfirm({ id: article.id, title: article.title });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    deleteArticle.mutate(deleteConfirm.id, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
    { field: "slug", headerName: "Slug", width: 160 },
    {
      field: "bonus",
      headerName: "Bonus",
      width: 160,
      renderCell: (params) => {
        const bonus = params.row.bonus as { id: string; title: string; slug: string } | undefined;
        return bonus ? `${bonus.title} (${bonus.slug})` : "—";
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2">{STATUS_LABELS[params.value] ?? params.value}</Typography>
      ),
    },
    {
      field: "publishDate",
      headerName: "Published",
      width: 110,
      renderCell: (params) => (params.value ? new Date(params.value as string).toLocaleDateString("en-US", { timeZone: "UTC" }) : ""),
    },
    {
      field: "createdBy",
      headerName: "Created by",
      width: 130,
      renderCell: (params) =>
        params.value
          ? (params.value as { name?: string | null; email: string }).name ??
            (params.value as { email: string }).email
          : "—",
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 110,
      renderCell: (params) => (params.value ? new Date(params.value as string).toLocaleDateString("en-US", { timeZone: "UTC" }) : ""),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" component={Link} href={`/bonus-articles/${params.row.slug}`} aria-label="View">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {canEdit(params.row, user?.role, user?.id) && (
            <>
              <IconButton size="small" component={Link} href={`/bonus-articles/${params.row.slug}/edit`} aria-label="Edit">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteClick(params.row)}
                disabled={deletingId === params.row.id}
                aria-label="Delete"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      ),
    },
  ];

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const bonuses = bonusesData?.items ?? [];

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader
        title="Bonus Articles"
        subtitle="Manage bonus-related articles and content."
        action={
          <Button component={Link} href="/bonus-articles/new" variant="contained" color="primary" startIcon={<AddIcon />}>
            Add Article
          </Button>
        }
      />
      <Paper sx={{ mb: 2, p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: "action.active", mr: 0.5 }} fontSize="small" /> }}
          sx={{ minWidth: { xs: "100%", sm: 200 }, flex: "1 1 auto" }}
        />
        <TextField
          select
          size="small"
          label="Bonus"
          value={bonusId}
          onChange={(e) => setBonusId(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 180 } }}
        >
          <MenuItem value="">All bonuses</MenuItem>
          {bonuses.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.title}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 140 } }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="published">{STATUS_LABELS.published}</MenuItem>
          <MenuItem value="draft">{STATUS_LABELS.draft}</MenuItem>
          <MenuItem value="pending">{STATUS_LABELS.pending}</MenuItem>
        </TextField>
      </Paper>
      <DataGridContainer>
        <DataGrid
          rows={items}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          paginationMode="server"
          paginationModel={{ page, pageSize: PAGE_SIZE }}
          onPaginationModelChange={(m) => setPage(m.page)}
          rowCount={total}
          pageSizeOptions={[PAGE_SIZE]}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover" },
            "& .MuiDataGrid-cell:focus": { outline: "none" },
          }}
        />
      </DataGridContainer>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, total)} of {total} results
      </Typography>
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete article"
        message={deleteConfirm ? `Delete "${deleteConfirm.title}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteArticle.isPending}
      />
    </Box>
  );
}
