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
import { useBlogsList, useDeleteBlog } from "@/hooks/useBlogs";
import { useAuth } from "@/contexts/AuthContext";
import type { Blog } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataGridContainer } from "@/components/layout/DataGridContainer";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { canEditOwnedContent } from "@/lib/contentPermissions";

const PAGE_SIZE = 10;

export default function BlogsPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState<string>("");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useBlogsList({
    page: page + 1,
    limit: PAGE_SIZE,
    status: status || undefined,
    isFeatured: isFeatured === "" ? undefined : isFeatured === "true",
    q: search || undefined,
  });
  const deleteBlog = useDeleteBlog();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  const handleDeleteClick = (blog: Blog) => {
    setDeleteConfirm({ id: blog.id, title: blog.title });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    deleteBlog.mutate(deleteConfirm.id, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  const columns: GridColDef[] = [
    { field: "title", headerName: "Title", flex: 1, minWidth: 200 },
    { field: "slug", headerName: "Slug", width: 160 },
    {
      field: "status",
      headerName: "Status",
      width: 110,
      renderCell: (params) => STATUS_LABELS[params.value] ?? params.value,
    },
    {
      field: "isFeatured",
      headerName: "Featured",
      width: 90,
      renderCell: (params) => (params.value ? "Yes" : "—"),
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
      renderCell: (params) => (params.value ? (params.value as { name?: string | null; email: string }).name ?? (params.value as { email: string }).email : "—"),
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
          <IconButton size="small" component={Link} href={`/blogs/${params.row.slug}`} aria-label="View">
            <VisibilityIcon fontSize="small" />
          </IconButton>
          {canEditOwnedContent(user?.role, user?.id, params.row.createdBy?.id) && (
            <>
              <IconButton size="small" component={Link} href={`/blogs/${params.row.slug}/edit`} aria-label="Edit">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => handleDeleteClick(params.row)} disabled={deletingId === params.row.id} aria-label="Delete">
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

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader
        title="Blogs"
        subtitle="Manage blog posts."
        action={<Button component={Link} href="/blogs/new" variant="contained" color="primary" startIcon={<AddIcon />}>Add Blog</Button>}
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
        <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: { xs: "100%", sm: 140 } }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="published">{STATUS_LABELS.published}</MenuItem>
          <MenuItem value="draft">{STATUS_LABELS.draft}</MenuItem>
          <MenuItem value="pending">{STATUS_LABELS.pending}</MenuItem>
        </TextField>
        <TextField select size="small" label="Featured" value={isFeatured} onChange={(e) => setIsFeatured(e.target.value)} sx={{ minWidth: { xs: "100%", sm: 120 } }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="true">Featured</MenuItem>
          <MenuItem value="false">Not featured</MenuItem>
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
          sx={{ border: "none", "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover" }, "& .MuiDataGrid-cell:focus": { outline: "none" } }}
        />
      </DataGridContainer>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        Showing {page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, total)} of {total} results
      </Typography>
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete blog"
        message={deleteConfirm ? `Delete "${deleteConfirm.title}"? This cannot be undone.` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteBlog.isPending}
      />
    </Box>
  );
}
