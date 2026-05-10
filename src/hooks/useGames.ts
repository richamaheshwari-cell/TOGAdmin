"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { Game, GamesListResponse } from "@/lib/types";
import { keepPreviousListData } from "@/lib/queryPagination";

interface GamesParams {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export function useGamesList(params: GamesParams) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.q) searchParams.set("q", params.q);
  const query = searchParams.toString();
  const path = `/admin/games${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: ["games", params],
    queryFn: () => api.get<GamesListResponse>(path).then((r) => r.data),
    placeholderData: keepPreviousListData,
  });
}

export function useGame(id: string | null) {
  return useQuery({
    queryKey: ["game", id],
    queryFn: () => api.get<Game>(`/admin/games/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

/** Full game by slug (includes casinos, seoTitle, seoDesc, focusKeywords, content). */
export function useGameBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["game", "by-slug", slug],
    queryFn: () => api.get<Game>(`/admin/game/${encodeURIComponent(slug ?? "")}`).then((r) => r.data),
    enabled: !!slug,
  });
}

export function useCreateGame() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<Game>("/admin/games", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["game", data.id], data);
      qc.setQueryData(["game", "by-slug", data.slug], data);
      qc.invalidateQueries({ queryKey: ["games"] });
      showSuccess("Game created");
    },
  });
}

export function useUpdateGame(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<Game>(`/admin/games/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["game", data.id], data);
      qc.setQueryData(["game", "by-slug", data.slug], data);
      qc.invalidateQueries({ queryKey: ["games"] });
      showSuccess("Game updated");
    },
  });
}

export function usePatchGameStatus(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (status: "published" | "draft" | "pending") =>
      api.patch<Game>(`/admin/games/${id}/status`, { status }).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["game", data.id], data);
      qc.setQueryData(["game", "by-slug", data.slug], data);
      qc.invalidateQueries({ queryKey: ["games"] });
      showSuccess("Status updated");
    },
  });
}

export function useDeleteGame() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/games/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["games"] });
      showSuccess("Game deleted");
    },
  });
}
