"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { AdminUser } from "@/lib/types";

export function useAdminUsersList() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get<AdminUser[]>("/admin/admin-users").then((r) => r.data),
  });
}

export function useCreateAdminUser() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: { email: string; password: string; role: string; name?: string; isActive?: boolean }) =>
      api.post<AdminUser>("/admin/admin-users", body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      showSuccess("User created");
    },
  });
}

export function useUpdateAdminUser(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: { name?: string; role?: string; isActive?: boolean }) =>
      api.put<AdminUser>(`/admin/admin-users/${id}`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      showSuccess("User updated");
    },
  });
}

export function useResetAdminUserPassword(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: { password: string }) =>
      api.put<{ reset: boolean }>(`/admin/admin-users/${id}/reset-password`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      showSuccess("Password reset");
    },
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/admin-users/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      showSuccess("User deleted");
    },
  });
}
