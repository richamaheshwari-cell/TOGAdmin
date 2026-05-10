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
import { useBonusesList, useCreateBonus, useUpdateBonus, useDeleteBonus } from "@/hooks/useBonuses";
import { BONUS_ICON_MAP } from "@/components/bonus/bonusIconsMap";
import { useAuth } from "@/contexts/AuthContext";
import type { Bonus, CasinoStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataGridContainer } from "@/components/layout/DataGridContainer";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { BonusModal } from "@/components/bonus";
import type { BonusSubmitValues } from "@/lib/bonusSchema";

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

function BonusIconCell({ iconKey }: { iconKey: string }) {
  if (!iconKey) return <Typography variant="caption" color="text.secondary">—</Typography>;
  const IconComponent = BONUS_ICON_MAP[iconKey];
  if (!IconComponent) {
    return <Typography variant="caption" color="text.secondary">{iconKey}</Typography>;
  }
  return <IconComponent fontSize="small" />;
}

export default function BonusesPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const { data, isLoading } = useBonusesList({
    page: page + 1,
    limit: PAGE_SIZE,
    status: status || undefined,
    q: search || undefined,
  });

  const createBonus = useCreateBonus();
  const updateBonus = useUpdateBonus(editingBonus?.id ?? "");
  const deleteBonus = useDeleteBonus();

  const handleCreate = useCallback(() => {
    setEditingBonus(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((bonus: Bonus) => {
    setEditingBonus(bonus);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingBonus(null);
  }, []);

  const handleSubmit = useCallback(
    async (values: BonusSubmitValues) => {
      if (editingBonus) {
        await updateBonus.mutateAsync({
          title: values.title,
          slug: values.slug,
          featureImg: values.featureImg || undefined,
          description: values.description,
          clientLink: values.clientLink?.trim() || undefined,
          highlight: values.highlight,
          bonusType: values.bonusType,
          iconKey: values.iconKey,
          status: values.status,
        });
      } else {
        await createBonus.mutateAsync({
          title: values.title,
          slug: values.slug,
          featureImg: values.featureImg || undefined,
          description: values.description,
          clientLink: values.clientLink?.trim() || undefined,
          highlight: values.highlight,
          bonusType: values.bonusType,
          iconKey: values.iconKey,
          status: values.status,
        });
      }
      handleCloseModal();
    },
    [editingBonus, createBonus, updateBonus, handleCloseModal]
  );

  const handleDeleteClick = useCallback((bonus: Bonus) => {
    setDeleteConfirm({ id: bonus.id, title: bonus.title });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteConfirm) return;
    deleteBonus.mutate(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) });
  }, [deleteConfirm, deleteBonus]);

  const canEdit = (bonus: Bonus) => {
    if (user?.role === "super_admin" || user?.role === "admin") return true;
    return bonus.createdBy?.id === user?.id;
  };

  const canDelete = canEdit;

  const columns: GridColDef[] = [
    {
      field: "featureImg",
      headerName: "Image",
      width: 70,
      renderCell: (params) =>
        params.row.featureImg ? (
          <Box
            component="img"
            src={params.row.featureImg}
            alt=""
            sx={{ width: 40, height: 40, borderRadius: 1, objectFit: "cover" }}
          />
        ) : (
          <Typography variant="caption" color="text.secondary">—</Typography>
        ),
    },
    {
      field: "iconKey",
      headerName: "Icon",
      width: 70,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40 }}>
          <BonusIconCell iconKey={params.row.iconKey} />
        </Box>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.slug}
          </Typography>
        </Box>
      ),
    },
    {
      field: "highlight",
      headerName: "Highlight",
      width: 140,
      renderCell: (params) => (
        <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
          {params.row.highlight || "—"}
        </Typography>
      ),
    },
    {
      field: "bonusType",
      headerName: "Type",
      width: 110,
      renderCell: (params) => (
        <Typography variant="body2">{params.row.bonusType ? params.row.bonusType.replace(/_/g, " ") : "—"}</Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 110,
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
      renderCell: (params) =>
        params.value
          ? (params.value as { name?: string | null; email: string }).name ??
            (params.value as { email: string }).email
          : "—",
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" suppressHydrationWarning>
          {formatRelativeTime(params.row.createdAt)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {canEdit(params.row) && (
            <IconButton size="small" onClick={() => handleEdit(params.row)} aria-label="Edit" disabled={updateBonus.isPending}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {canDelete(params.row) && (
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDeleteClick(params.row)}
              aria-label="Delete"
              disabled={deleteBonus.isPending}
            >
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
        title="Bonuses"
        subtitle="Manage bonus offers and promotions"
        action={
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreate} fullWidth={false}>
            Add Bonus
          </Button>
        }
      />

      <Paper sx={{ mb: 2, p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search bonuses..."
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
            <MenuItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </MenuItem>
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
        Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, rowCount)} of {rowCount} results
      </Typography>

      <BonusModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        bonus={editingBonus}
        title={editingBonus ? "Edit bonus" : "Create bonus"}
        submitLabel={editingBonus ? "Update" : "Create"}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete bonus"
        message={deleteConfirm ? `Delete "${deleteConfirm.title}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteBonus.isPending}
      />
    </Box>
  );
}
