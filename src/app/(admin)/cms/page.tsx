"use client";

import { useState } from "react";
import { Box, Button, IconButton } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Link from "next/link";
import { usePagesList, useDeletePage } from "@/hooks/usePages";
import { useAuth } from "@/contexts/AuthContext";
import type { CmsPage } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataGridContainer } from "@/components/layout/DataGridContainer";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

function canEdit(page: CmsPage, currentUserId?: string) {
  return !currentUserId || page.createdBy?.id === currentUserId;
}

export default function PagesCmsPage() {
  const { user } = useAuth();
  const { data: pages = [], isLoading } = usePagesList();
  const deletePage = useDeletePage();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteClick = (page: CmsPage) => {
    setDeleteConfirm({ id: page.id, title: page.title });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    deletePage.mutate(deleteConfirm.id, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 180 },
    { field: "slug", headerName: "Slug", width: 160 },
    {
      field: "isPublished",
      headerName: "Published",
      width: 100,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
    { field: "sortOrder", headerName: "Order", width: 80 },
    {
      field: "createdBy",
      headerName: "Created by",
      width: 140,
      renderCell: (params) => (params.value ? (params.value as { name?: string | null; email: string }).name ?? (params.value as { email: string }).email : "—"),
    },
    {
      field: "updatedBy",
      headerName: "Updated by",
      width: 140,
      renderCell: (params) => (params.value ? (params.value as { name?: string | null; email: string }).name ?? (params.value as { email: string }).email : "—"),
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 120,
      renderCell: (params) => (params.value ? new Date(params.value as string).toLocaleDateString("en-US", { timeZone: "UTC" }) : ""),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" component={Link} href={`/cms/${params.row.slug}`} aria-label="View">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {canEdit(params.row, user?.id) && (
            <>
              <IconButton size="small" component={Link} href={`/cms/${params.row.slug}/edit`} aria-label="Edit">
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

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader
        title="Pages (CMS)"
        subtitle="Manage static pages and content."
        action={<Button component={Link} href="/cms/new" variant="contained" color="primary" startIcon={<AddIcon />}>Add Page</Button>}
      />
      <DataGridContainer height={400}>
        <DataGrid
          rows={pages}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          sx={{
            border: "none",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover" },
            "& .MuiDataGrid-cell:focus": { outline: "none" },
          }}
        />
      </DataGridContainer>
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete page"
        message={deleteConfirm ? `Delete "${deleteConfirm.title}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={deletePage.isPending}
      />
    </Box>
  );
}
