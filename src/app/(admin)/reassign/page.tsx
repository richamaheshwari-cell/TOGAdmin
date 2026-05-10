"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { useRoleEditors, useReassign, useRoleHistory } from "@/hooks/useRole";
import { ROLE_LABELS } from "@/lib/constants";
import { getDisplayErrorMessage } from "@/lib/errorUtils";
import type { RoleHistoryAction } from "@/lib/types";

const ACTION_LABELS: Record<RoleHistoryAction, string> = {
  assigned: "Assigned",
  role_updated: "Role updated",
  revoked: "Revoked",
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  all: "All content (casinos, pages, casino articles, games, game articles, blogs, news, bonuses, bonus articles)",
  casino: "Casinos only",
  page: "Pages only",
  casino_article: "Casino articles only",
  game: "Games only",
  game_article: "Game articles only",
  blog: "Blogs only",
  news: "News only",
  bonus: "Bonuses only",
  bonus_article: "Bonus articles only",
};

const HISTORY_LIMIT = 10;

export default function ReassignPage() {
  const { data: editors = [], isLoading } = useRoleEditors();
  const reassign = useReassign();
  const [fromUserId, setFromUserId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [contentType, setContentType] = useState<"casino" | "page" | "casino_article" | "game" | "game_article" | "blog" | "news" | "bonus" | "bonus_article" | "all">("all");
  const [ids, setIds] = useState("");
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [historyUserId, setHistoryUserId] = useState("");
  const [historyPage, setHistoryPage] = useState(0);
  const { data: historyData, isLoading: historyLoading } = useRoleHistory({
    userId: historyUserId || undefined,
    page: historyPage + 1,
    limit: HISTORY_LIMIT,
  });

  const fromUser = editors.find((u) => u.id === fromUserId);
  const toUser = editors.find((u) => u.id === toUserId);

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fromUserId || !toUserId) {
      setError('Select both "From" and "To" users.');
      return;
    }
    if (fromUserId === toUserId) {
      setError("From and To must be different users.");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmReassign = async () => {
    try {
      const result = await reassign.mutateAsync({
        fromUserId,
        toUserId,
        contentType,
        ids: ids.trim() ? ids.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      });
      setConfirmOpen(false);
      setSuccessMessage(result.message ?? `Reassigned: ${result.casinosUpdated} casinos, ${result.pagesUpdated} pages, ${result.casinoArticlesUpdated} articles.`);
      setFromUserId("");
      setToUserId("");
      setIds("");
    } catch (err) {
      setError(getDisplayErrorMessage(err, "Reassign failed"));
      setConfirmOpen(false);
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
        Reassign content
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Transfer content ownership from one user to another. The target user will be able to edit and delete the reassigned items (e.g. when an editor leaves).
      </Typography>
      <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 520, width: "100%" }}>
        {isLoading ? (
          <Typography color="text.secondary">Loading editors…</Typography>
        ) : (
          <form onSubmit={handleSubmitClick}>
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            <TextField
              select
              fullWidth
              label="From user"
              value={fromUserId}
              onChange={(e) => setFromUserId(e.target.value)}
              sx={{ mb: 2 }}
              helperText="User who currently owns the content"
            >
              <MenuItem value="">Select user</MenuItem>
              {editors.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name || u.email} ({ROLE_LABELS[u.role] ?? u.role})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="To user"
              value={toUserId}
              onChange={(e) => setToUserId(e.target.value)}
              sx={{ mb: 2 }}
              helperText="User who will receive ownership (can edit/delete)"
            >
              <MenuItem value="">Select user</MenuItem>
              {editors.map((u) => (
                <MenuItem key={u.id} value={u.id}>
                  {u.name || u.email} ({ROLE_LABELS[u.role] ?? u.role})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Content type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as typeof contentType)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="all">All content</MenuItem>
              <MenuItem value="casino">Casinos only</MenuItem>
              <MenuItem value="page">Pages only</MenuItem>
              <MenuItem value="casino_article">Casino articles only</MenuItem>
              <MenuItem value="game">Games only</MenuItem>
              <MenuItem value="game_article">Game articles only</MenuItem>
              <MenuItem value="blog">Blogs only</MenuItem>
              <MenuItem value="news">News only</MenuItem>
              <MenuItem value="bonus">Bonuses only</MenuItem>
              <MenuItem value="bonus_article">Bonus articles only</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Resource IDs (optional)"
              placeholder="Leave empty to reassign all of the selected type"
              value={ids}
              onChange={(e) => setIds(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Comma-separated UUIDs to reassign only specific items"
            />
            <Button type="submit" variant="contained" color="primary" disabled={reassign.isPending}>
              {reassign.isPending ? "Reassigning…" : "Reassign content"}
            </Button>
          </form>
        )}
      </Paper>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onClose={() => !reassign.isPending && setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm reassign</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Reassign {CONTENT_TYPE_LABELS[contentType]} from <strong>{fromUser?.name || fromUser?.email}</strong> to{" "}
            <strong>{toUser?.name || toUser?.email}</strong>?
            <Box component="span" display="block" sx={{ mt: 2 }}>
              The target user will then be able to edit and delete these items; they will appear as owner in their list.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} disabled={reassign.isPending}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleConfirmReassign} disabled={reassign.isPending}>
            {reassign.isPending ? "Reassigning…" : "Reassign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success dialog – show API message so admin sees target user has edit/delete rights */}
      <Dialog open={!!successMessage} onClose={() => setSuccessMessage(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "success.main" }}>Reassign successful</DialogTitle>
        <DialogContent>
          <DialogContentText component="div" sx={{ whiteSpace: "pre-wrap" }}>
            {successMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => setSuccessMessage(null)}>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role assignment history */}
      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
        Role assignment history
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Who assigned or updated roles, and when. Filter by user to see history for one person.
      </Typography>
      <Paper sx={{ overflow: "hidden", mb: 2 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            select
            size="small"
            label="Filter by user"
            value={historyUserId}
            onChange={(e) => { setHistoryUserId(e.target.value); setHistoryPage(0); }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">All users</MenuItem>
            {editors.map((u) => (
              <MenuItem key={u.id} value={u.id}>{u.name || u.email}</MenuItem>
            ))}
          </TextField>
        </Box>
        {historyLoading ? (
          <Typography sx={{ p: 3 }} color="text.secondary">Loading history…</Typography>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Performed by</TableCell>
                    <TableCell>Target user</TableCell>
                    <TableCell>Previous / New role</TableCell>
                    <TableCell>Reassigned to</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(historyData?.items ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{new Date(row.createdAt).toLocaleString("en-US", { timeZone: "UTC" })}</TableCell>
                      <TableCell>{ACTION_LABELS[row.action] ?? row.action}</TableCell>
                      <TableCell>{row.performedBy.name || row.performedBy.email}</TableCell>
                      <TableCell>{row.targetUser.name || row.targetUser.email}</TableCell>
                      <TableCell>
                        {(row.previousRole ? ROLE_LABELS[row.previousRole as keyof typeof ROLE_LABELS] ?? row.previousRole : "—")}
                        {" → "}
                        {(row.newRole ? ROLE_LABELS[row.newRole as keyof typeof ROLE_LABELS] ?? row.newRole : "—")}
                      </TableCell>
                      <TableCell>
                        {row.reassignedTo ? (row.reassignedTo.name || row.reassignedTo.email) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {historyData && historyData.totalPages > 1 && (
              <TablePagination
                component="div"
                count={historyData.total}
                page={historyPage}
                onPageChange={(_, p) => setHistoryPage(p)}
                rowsPerPage={HISTORY_LIMIT}
                rowsPerPageOptions={[HISTORY_LIMIT]}
              />
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
