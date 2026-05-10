"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { RoleEditor, ReassignResponse, RoleHistoryListResponse, RevokeUserResponse } from "@/lib/types";

export function useRoleEditors() {
  return useQuery({
    queryKey: ["role", "editors"],
    queryFn: () => api.get<RoleEditor[]>("/admin/role/editors").then((r) => r.data),
  });
}

export function useRoleHistory(params: { userId?: string; page?: number; limit?: number }) {
  const { userId, page = 1, limit = 20 } = params;
  return useQuery({
    queryKey: ["role", "history", userId ?? "all", page, limit],
    queryFn: () => {
      const search = new URLSearchParams();
      if (userId) search.set("userId", userId);
      search.set("page", String(page));
      search.set("limit", String(limit));
      return api.get<RoleHistoryListResponse>(`/admin/role/history?${search}`).then((r) => r.data);
    },
    enabled: true,
  });
}

export function useReassign() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: {
      fromUserId: string;
      toUserId: string;
      contentType: "casino" | "page" | "casino_article" | "game" | "game_article" | "blog" | "news" | "bonus" | "bonus_article" | "all";
      ids?: string[];
    }) =>
      api.post<ReassignResponse>("/admin/role/reassign", body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["casinos"] });
      qc.invalidateQueries({ queryKey: ["pages"] });
      qc.invalidateQueries({ queryKey: ["casino-articles"] });
      qc.invalidateQueries({ queryKey: ["games"] });
      qc.invalidateQueries({ queryKey: ["game-articles"] });
      qc.invalidateQueries({ queryKey: ["blogs"] });
      qc.invalidateQueries({ queryKey: ["news"] });
      qc.invalidateQueries({ queryKey: ["bonuses"] });
      qc.invalidateQueries({ queryKey: ["bonus-articles"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["role", "history"] });
      showSuccess("Content reassigned");
    },
  });
}

export function useRevokeUser(userId: string | null) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: { reassignToUserId?: string }) =>
      api.post<RevokeUserResponse>(`/admin/admin-users/${userId}/revoke`, body).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["role", "history"] });
      showSuccess("Access revoked");
    },
  });
}
