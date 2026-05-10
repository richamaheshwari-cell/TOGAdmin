"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { Snackbar } from "@mui/material";

interface ToastContextValue {
  showSuccess: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const showSuccess = useCallback((msg: string) => {
    setMessage(msg);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <ToastContext.Provider value={{ showSuccess }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={handleClose}
        message={message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{ sx: { bgcolor: "success.main", color: "success.contrastText" } }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
