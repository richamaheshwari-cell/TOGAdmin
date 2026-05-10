"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { CmsPage } from "@/lib/types";

export function usePagesList() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      const res = await api.get<CmsPage[] | { items?: CmsPage[] }>("/admin/pages");
      const data = res.data;
      return Array.isArray(data) ? data : (data as { items: CmsPage[] }).items ?? [];
    },
  });
}

/** Resolve a page by slug (for slug-based routes). */
export function usePageBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["page", "by-slug", slug],
    queryFn: async () => {
      const res = await api.get<CmsPage[] | { items?: CmsPage[] }>("/admin/pages");
      const pages = Array.isArray(res.data) ? res.data : (res.data as { items?: CmsPage[] }).items ?? [];
      return pages.find((p) => p.slug === slug) ?? null;
    },
    enabled: !!slug,
  });
}

export function usePage(id: string | null) {
  return useQuery({
    queryKey: ["page", id],
    queryFn: () => api.get<CmsPage>(`/admin/pages/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<CmsPage>("/admin/pages", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["page", data.id], data);
      qc.setQueryData(["page", "by-slug", data.slug], data);
      qc.invalidateQueries({ queryKey: ["pages"] });
      showSuccess("Page created");
    },
  });
}

export function useUpdatePage(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<CmsPage>(`/admin/pages/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["page", data.id], data);
      qc.setQueryData(["page", "by-slug", data.slug], data);
      qc.invalidateQueries({ queryKey: ["pages"] });
      showSuccess("Page updated");
    },
  });
}

export function useDeletePage() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/pages/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pages"] });
      showSuccess("Page deleted");
    },
  });
}
