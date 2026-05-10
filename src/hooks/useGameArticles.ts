"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { GameArticle, GameArticlesListResponse } from "@/lib/types";
import { keepPreviousListData } from "@/lib/queryPagination";

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export function useGameArticlesList(params: ListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.q) searchParams.set("q", params.q);
  const query = searchParams.toString();
  const path = `/admin/game-articles${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: ["game-articles", params],
    queryFn: () => api.get<GameArticlesListResponse>(path).then((r) => r.data),
    placeholderData: keepPreviousListData,
  });
}

export function useGameArticle(id: string | null) {
  return useQuery({
    queryKey: ["game-article", id],
    queryFn: () => api.get<GameArticle>(`/admin/game-articles/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useGameArticleBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["game-article", "by-slug", slug],
    queryFn: async () => {
      const res = await api.get<GameArticlesListResponse>(
        `/admin/game-articles?q=${encodeURIComponent(slug ?? "")}&limit=50`
      );
      const found = res.data.items.find((a) => a.slug === slug);
      return found ?? null;
    },
    enabled: !!slug,
  });
}

export function useCreateGameArticle() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<GameArticle>("/admin/game-articles", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["game-article", data.id], data);
      qc.invalidateQueries({ queryKey: ["game-articles"] });
      showSuccess("Article created");
    },
  });
}

export function useUpdateGameArticle(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<GameArticle>(`/admin/game-articles/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["game-article", data.id], data);
      qc.invalidateQueries({ queryKey: ["game-articles"] });
      showSuccess("Article updated");
    },
  });
}

export function useDeleteGameArticle() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/game-articles/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["game-articles"] });
      showSuccess("Article deleted");
    },
  });
}
