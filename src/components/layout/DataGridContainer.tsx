"use client";

import { Paper } from "@mui/material";

interface DataGridContainerProps {
  children: React.ReactNode;
  height?: number;
}

/** Wraps DataGrid with responsive height and horizontal scroll. */
export function DataGridContainer({ children, height = 480 }: DataGridContainerProps) {
  return (
    <Paper
      sx={{
        width: "100%",
        minWidth: 0,
        height: { xs: 400, sm: height },
        overflow: "hidden",
        "& .MuiDataGrid-root": {
          minWidth: 600,
        },
        "& .MuiDataGrid-main": {
          overflow: "auto",
        },
      }}
    >
      {children}
    </Paper>
  );
}
