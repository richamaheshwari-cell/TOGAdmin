"use client";

import { useState } from "react";
import { Box, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { useNewsletterList, type NewsletterStatusFilter } from "@/hooks/useNewsletter";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataGridContainer } from "@/components/layout/DataGridContainer";

const PAGE_SIZE = 25;

export default function NewsletterPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<NewsletterStatusFilter>("");

  const { data, isLoading } = useNewsletterList({
    page: page + 1,
    limit: PAGE_SIZE,
    status: status || undefined,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns: GridColDef[] = [
    { field: "email", headerName: "Email", flex: 1, minWidth: 220 },
    {
      field: "subscribed",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (params.value ? "Subscribed" : "Unsubscribed"),
    },
    {
      field: "subscribedAt",
      headerName: "Subscribed at",
      width: 160,
      renderCell: (params) =>
        params.value ? new Date(params.value as string).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }) : "—",
    },
    {
      field: "unsubscribedAt",
      headerName: "Unsubscribed at",
      width: 160,
      renderCell: (params) =>
        params.value ? new Date(params.value as string).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }) : "—",
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 160,
      renderCell: (params) =>
        params.value ? new Date(params.value as string).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" }) : "—",
    },
  ];

  const paginationModel: GridPaginationModel = { page, pageSize: PAGE_SIZE };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      <PageHeader title="Newsletter" subtitle="View newsletter subscription list" />

      <Paper sx={{ mb: 2, p: 2, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as NewsletterStatusFilter);
            setPage(0);
          }}
          sx={{ minWidth: { xs: "100%", sm: 160 } }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="subscribed">Subscribed</MenuItem>
          <MenuItem value="unsubscribed">Unsubscribed</MenuItem>
        </TextField>
      </Paper>

      <DataGridContainer>
        <DataGrid
          rows={items}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => (row as { id?: string }).id ?? row.email}
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPage(model.page)}
          rowCount={total}
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
        Showing {total === 0 ? 0 : page * PAGE_SIZE + 1} to {Math.min((page + 1) * PAGE_SIZE, total)} of {total} results
      </Typography>
    </Box>
  );
}
