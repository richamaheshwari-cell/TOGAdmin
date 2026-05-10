"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { BonusArticle, BonusArticlesListResponse } from "@/lib/types";
import { keepPreviousListData } from "@/lib/queryPagination";

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  bonusId?: string;
  q?: string;
}

export function useBonusArticlesList(params: ListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.bonusId) searchParams.set("bonusId", params.bonusId);
  if (params.q) searchParams.set("q", params.q);
  const query = searchParams.toString();
  const path = `/admin/bonus-articles${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: ["bonus-articles", params],
    queryFn: () => api.get<BonusArticlesListResponse>(path).then((r) => r.data),
    placeholderData: keepPreviousListData,
  });
}

export function useBonusArticle(id: string | null) {
  return useQuery({
    queryKey: ["bonus-article", id],
    queryFn: () => api.get<BonusArticle>(`/admin/bonus-articles/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useBonusArticleBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["bonus-article", "by-slug", slug],
    queryFn: async () => {
      const res = await api.get<BonusArticlesListResponse>(
        `/admin/bonus-articles?q=${encodeURIComponent(slug ?? "")}&limit=50`
      );
      const found = res.data.items.find((a) => a.slug === slug);
      return found ?? null;
    },
    enabled: !!slug,
  });
}

export function useCreateBonusArticle() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<BonusArticle>("/admin/bonus-articles", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["bonus-article", data.id], data);
      qc.invalidateQueries({ queryKey: ["bonus-articles"] });
      showSuccess("Bonus article created");
    },
  });
}

export function useUpdateBonusArticle(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<BonusArticle>(`/admin/bonus-articles/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["bonus-article", data.id], data);
      qc.invalidateQueries({ queryKey: ["bonus-articles"] });
      showSuccess("Bonus article updated");
    },
  });
}

export function useDeleteBonusArticle() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/bonus-articles/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bonus-articles"] });
      showSuccess("Bonus article deleted");
    },
  });
}
