"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { Blog, BlogsListResponse } from "@/lib/types";
import { keepPreviousListData } from "@/lib/queryPagination";

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  isFeatured?: boolean;
  q?: string;
}

export function useBlogsList(params: ListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.isFeatured !== undefined) searchParams.set("isFeatured", String(params.isFeatured));
  if (params.q) searchParams.set("q", params.q);
  const query = searchParams.toString();
  const path = `/admin/blogs${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: ["blogs", params],
    queryFn: () => api.get<BlogsListResponse>(path).then((r) => r.data),
    placeholderData: keepPreviousListData,
  });
}

export function useBlog(id: string | null) {
  return useQuery({
    queryKey: ["blog", id],
    queryFn: () => api.get<Blog>(`/admin/blogs/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useBlogBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["blog", "by-slug", slug],
    queryFn: async () => {
      const res = await api.get<BlogsListResponse>(
        `/admin/blogs?q=${encodeURIComponent(slug ?? "")}&limit=50`
      );
      const found = res.data.items.find((b) => b.slug === slug);
      return found ?? null;
    },
    enabled: !!slug,
  });
}

export function useCreateBlog() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<Blog>("/admin/blogs", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["blog", data.id], data);
      qc.invalidateQueries({ queryKey: ["blogs"] });
      showSuccess("Blog created");
    },
  });
}

export function useUpdateBlog(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<Blog>(`/admin/blogs/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["blog", data.id], data);
      qc.invalidateQueries({ queryKey: ["blogs"] });
      showSuccess("Blog updated");
    },
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/blogs/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blogs"] });
      showSuccess("Blog deleted");
    },
  });
}
