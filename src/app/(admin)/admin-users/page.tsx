"use client";

import { useState } from "react";
import { Box, Button, IconButton, Paper, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyIcon from "@mui/icons-material/Key";
import Link from "next/link";
import { useAdminUsersList, useDeleteAdminUser } from "@/hooks/useAdminUsers";
import { useAuth } from "@/contexts/AuthContext";
import type { AdminUser } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/constants";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataGridContainer } from "@/components/layout/DataGridContainer";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useAdminUsersList();
  const deleteUser = useDeleteAdminUser();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);

  const isSuperAdmin = currentUser?.role === "super_admin";
  const canEdit = (u: AdminUser) => isSuperAdmin && !u.isSystem;
  const canDelete = (u: AdminUser) => isSuperAdmin && !u.isSystem;
  const canResetPassword = (u: AdminUser) => isSuperAdmin && !u.isSystem;

  const handleDeleteClick = (u: AdminUser) => {
    if (u.isSystem) return;
    setDeleteConfirm(u);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);
    deleteUser.mutate(deleteConfirm.id, {
      onSettled: () => setDeletingId(null),
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  const columns: GridColDef[] = [
    { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
    { field: "name", headerName: "Name", width: 160 },
    {
      field: "role",
      headerName: "Role",
      width: 130,
      renderCell: (params) => (ROLE_LABELS[String(params.value)] ?? params.value),
    },
    {
      field: "isActive",
      headerName: "Active",
      width: 80,
      renderCell: (params) => (params.value ? "Yes" : "No"),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 110,
      renderCell: (params) => (params.value ? new Date(params.value as string).toLocaleDateString("en-US", { timeZone: "UTC" }) : ""),
    },
    {
      field: "lastLoginAt",
      headerName: "Last login",
      width: 160,
      renderCell: (params) =>
        params.value
          ? new Date(params.value as string).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" })
          : "—",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      renderCell: (params) => {
        const u = params.row as AdminUser;
        return (
          <Box>
            {canEdit(u) && (
              <>
                <IconButton size="small" component={Link} href={`/admin-users/${u.id}`} aria-label="Edit">
                  <EditIcon fontSize="small" />
                </IconButton>
                {canResetPassword(u) && (
                  <IconButton size="small" component={Link} href={`/admin-users/${u.id}?reset=1`} aria-label="Reset password">
                    <KeyIcon fontSize="small" />
                  </IconButton>
                )}
                {canDelete(u) && (
                  <IconButton size="small" color="error" onClick={() => handleDeleteClick(u)} disabled={deletingId === u.id} aria-label="Delete">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader
        title="Admin Users"
        subtitle="Manage admin accounts and roles."
        action={<Button component={Link} href="/admin-users/new" variant="contained" color="primary" startIcon={<AddIcon />}>Add User</Button>}
      />
      <DataGridContainer height={440}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          sx={{ border: "none", "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover" }, "& .MuiDataGrid-cell:focus": { outline: "none" } }}
        />
      </DataGridContainer>
      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete admin user"
        message={deleteConfirm ? `Delete user ${deleteConfirm.email}? They will lose access. This cannot be undone.` : ""}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm(null)}
        loading={deleteUser.isPending}
      />
    </Box>
  );
}
