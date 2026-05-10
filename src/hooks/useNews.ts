"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { News, NewsListResponse } from "@/lib/types";
import { keepPreviousListData } from "@/lib/queryPagination";

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  isTrending?: boolean;
  q?: string;
}

export function useNewsList(params: ListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.isTrending !== undefined) searchParams.set("isTrending", String(params.isTrending));
  if (params.q) searchParams.set("q", params.q);
  const query = searchParams.toString();
  const path = `/admin/news${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: ["news", params],
    queryFn: () => api.get<NewsListResponse>(path).then((r) => r.data),
    placeholderData: keepPreviousListData,
  });
}

export function useNewsItem(id: string | null) {
  return useQuery({
    queryKey: ["news-item", id],
    queryFn: () => api.get<News>(`/admin/news/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useNewsBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["news-item", "by-slug", slug],
    queryFn: async () => {
      const res = await api.get<NewsListResponse>(
        `/admin/news?q=${encodeURIComponent(slug ?? "")}&limit=50`
      );
      const found = res.data.items.find((n) => n.slug === slug);
      return found ?? null;
    },
    enabled: !!slug,
  });
}

export function useCreateNews() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<News>("/admin/news", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["news-item", data.id], data);
      qc.invalidateQueries({ queryKey: ["news"] });
      showSuccess("News created");
    },
  });
}

export function useUpdateNews(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<News>(`/admin/news/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["news-item", data.id], data);
      qc.invalidateQueries({ queryKey: ["news"] });
      showSuccess("News updated");
    },
  });
}

export function useDeleteNews() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/news/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["news"] });
      showSuccess("News deleted");
    },
  });
}
