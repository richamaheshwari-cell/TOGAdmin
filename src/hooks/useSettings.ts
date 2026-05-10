"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { Settings } from "@/lib/types";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get<Settings>("/admin/settings").then((r) => r.data),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Partial<Settings>) =>
      api.put<Settings>("/admin/settings", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["settings"], data);
      showSuccess("Settings saved");
    },
  });
}
