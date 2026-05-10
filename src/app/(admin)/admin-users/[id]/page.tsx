"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, TextField, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyIcon from "@mui/icons-material/Key";
import BlockIcon from "@mui/icons-material/Block";
import Link from "next/link";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminUsersList } from "@/hooks/useAdminUsers";
import { useRoleEditors, useRevokeUser } from "@/hooks/useRole";
import { ROLE_LABELS } from "@/lib/constants";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import { Skeleton } from "@mui/material";
import type { AdminUser } from "@/lib/types";

export default function AdminUserDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const qc = useQueryClient();
  const id = params.id as string;
  const showReset = searchParams.get("reset") === "1";
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "super_admin";

  const { data: users = [], isLoading } = useAdminUsersList();
  const { data: editors = [] } = useRoleEditors();
  const adminUser = users.find((u) => u.id === id);
  const revokeMutation = useRevokeUser(adminUser?.id ?? null);

  const [resetOpen, setResetOpen] = useState(showReset);
  const [newPassword, setNewPassword] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [editValues, setEditValues] = useState<{ name: string; role: string; isActive: boolean } | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [reassignToUserId, setReassignToUserId] = useState("");
  const [revokeSuccess, setRevokeSuccess] = useState<string | null>(null);

  const canRevoke =
    adminUser &&
    !adminUser.isSystem &&
    (isSuperAdmin || (currentUser?.role === "admin" && (adminUser.role === "editor" || adminUser.role === "seo_editor")));

  if (!adminUser && !isLoading) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/admin-users" sx={{ mb: 2 }}>Back</Button>
        <Typography color="text.secondary">User not found.</Typography>
      </Box>
    );
  }

  const canEdit = isSuperAdmin && !adminUser?.isSystem;

  const handleResetSubmit = async () => {
    if (!adminUser || newPassword.length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }
    setResetError("");
    setResetSubmitting(true);
    try {
      await api.put<{ reset: boolean }>(`/admin/admin-users/${id}/reset-password`, { password: newPassword });
      setResetOpen(false);
      setNewPassword("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setResetError(getDisplayErrorMessage(err, "Failed to reset password"));
    } finally {
      setResetSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editValues) return;
    setEditSubmitting(true);
    try {
      await api.put<AdminUser>(`/admin/admin-users/${id}`, {
        name: editValues.name || undefined,
        role: editValues.role as AdminUser["role"],
        isActive: editValues.isActive,
      });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setEditValues(null);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!adminUser?.id) return;
    try {
      const result = await revokeMutation.mutateAsync({
        reassignToUserId: reassignToUserId || undefined,
      });
      setRevokeOpen(false);
      setReassignToUserId("");
      const parts = [result.message ?? "Access revoked."];
      if (result.casinosReassigned != null || result.pagesReassigned != null || result.casinoArticlesReassigned != null) {
        parts.push(` Casinos: ${result.casinosReassigned ?? 0}, Pages: ${result.pagesReassigned ?? 0}, Articles: ${result.casinoArticlesReassigned ?? 0}.`);
      }
      setRevokeSuccess(parts.join(""));
      router.push("/admin-users");
    } catch (err) {
      setRevokeSuccess(null);
      // error will be shown by mutation
    }
  };

  if (isLoading || !adminUser) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/admin-users" sx={{ mb: 2 }}>Back</Button>
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Button startIcon={<ArrowBackIcon />} component={Link} href="/admin-users" sx={{ mb: 2 }}>Back to Admin Users</Button>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" }, wordBreak: "break-all" }}>{adminUser.email}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>{ROLE_LABELS[adminUser.role] ?? adminUser.role}</Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2, overflow: "hidden" }}>
        <Typography variant="subtitle2" color="text.secondary">Name</Typography>
        <Typography sx={{ mb: 2 }}>{adminUser.name ?? "—"}</Typography>
        <Typography variant="subtitle2" color="text.secondary">Active</Typography>
        <Typography sx={{ mb: 2 }}>{adminUser.isActive ? "Yes" : "No"}</Typography>
        {adminUser.createdAt && (
          <>
            <Typography variant="subtitle2" color="text.secondary">Created</Typography>
            <Typography>{new Date(adminUser.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}</Typography>
          </>
        )}
        {canEdit && (
          <Box sx={{ mt: 2 }}>
            {editValues === null ? (
              <Button variant="outlined" onClick={() => setEditValues({ name: adminUser.name ?? "", role: adminUser.role, isActive: adminUser.isActive ?? true })}>
                Edit user
              </Button>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 320, mt: 2 }}>
                <TextField label="Name" value={editValues.name} onChange={(e) => setEditValues((v) => v ? { ...v, name: e.target.value } : v)} fullWidth />
                <TextField select label="Role" value={editValues.role} onChange={(e) => setEditValues((v) => v ? { ...v, role: e.target.value } : v)} fullWidth>
                  <MenuItem value="super_admin">{ROLE_LABELS.super_admin}</MenuItem>
                  <MenuItem value="admin">{ROLE_LABELS.admin}</MenuItem>
                  <MenuItem value="editor">{ROLE_LABELS.editor}</MenuItem>
                  <MenuItem value="seo_editor">{ROLE_LABELS.seo_editor}</MenuItem>
                </TextField>
                <FormControlLabel
                  control={<Checkbox checked={editValues.isActive} onChange={(e) => setEditValues((v) => v ? { ...v, isActive: e.target.checked } : v)} />}
                  label="Active"
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="contained" onClick={handleEditSubmit} disabled={editSubmitting}>Save</Button>
                  <Button onClick={() => setEditValues(null)}>Cancel</Button>
                </Box>
              </Box>
            )}
            {!adminUser.isSystem && (
              <Button startIcon={<KeyIcon />} sx={{ mt: 2, ml: 1 }} onClick={() => setResetOpen(true)}>
                Reset password
              </Button>
            )}
            {canRevoke && (
              <Button startIcon={<BlockIcon />} color="error" sx={{ mt: 2, ml: 1 }} onClick={() => setRevokeOpen(true)}>
                Revoke access
              </Button>
            )}
          </Box>
        )}
      </Paper>

      <Dialog open={revokeOpen} onClose={() => !revokeMutation.isPending && setRevokeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Revoke access</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Revoke access for <strong>{adminUser?.name || adminUser?.email}</strong>? They will be set inactive and cannot log in.
          </DialogContentText>
          <TextField
            select
            fullWidth
            size="small"
            label="Reassign content to (optional)"
            value={reassignToUserId}
            onChange={(e) => setReassignToUserId(e.target.value)}
            helperText="If set, all their casinos, pages and articles will be reassigned to this user before revoking."
          >
            <MenuItem value="">Do not reassign</MenuItem>
            {editors.filter((u) => u.id !== adminUser?.id).map((u) => (
              <MenuItem key={u.id} value={u.id}>{u.name || u.email}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRevokeOpen(false)} disabled={revokeMutation.isPending}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleRevokeConfirm} disabled={revokeMutation.isPending}>
            {revokeMutation.isPending ? "Revoking…" : "Revoke access"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!revokeSuccess} onClose={() => setRevokeSuccess(null)}>
        <DialogTitle sx={{ color: "success.main" }}>Revoked</DialogTitle>
        <DialogContent>
          <DialogContentText>{revokeSuccess}</DialogContentText>
        </DialogContent>
        <DialogActions><Button onClick={() => setRevokeSuccess(null)}>OK</Button></DialogActions>
      </Dialog>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle>Reset password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!resetError}
            helperText={resetError}
            inputProps={{ minLength: 8 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button onClick={handleResetSubmit} variant="contained" color="primary" disabled={resetSubmitting || newPassword.length < 8}>
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
