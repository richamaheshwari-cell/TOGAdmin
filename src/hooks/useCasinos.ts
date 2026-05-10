"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { Casino, CasinosListResponse } from "@/lib/types";
import { keepPreviousListData } from "@/lib/queryPagination";

interface CasinosParams {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export function useCasinosList(params: CasinosParams) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.q) searchParams.set("q", params.q);
  const query = searchParams.toString();
  const path = `/admin/casinos${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: ["casinos", params],
    queryFn: () => api.get<CasinosListResponse>(path).then((r) => r.data),
    placeholderData: keepPreviousListData,
  });
}

export function useCasino(id: string | null) {
  return useQuery({
    queryKey: ["casino", id],
    queryFn: () => api.get<Casino>(`/admin/casinos/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

/** Fetch one casino by slug. Uses GET /api/v1/admin/casino/:slug (full details: seoTitle, seoDesc, content). */
export function useCasinoBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["casino", "by-slug", slug],
    queryFn: () => api.get<Casino>(`/admin/casino/${encodeURIComponent(slug ?? "")}`).then((r) => r.data),
    enabled: !!slug,
  });
}

export function useCreateCasino() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<Casino>("/admin/casinos", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["casino", data.id], data);
      qc.setQueryData(["casino", "by-slug", data.slug], data);
      qc.invalidateQueries({ queryKey: ["casinos"] });
      showSuccess("Casino created");
    },
  });
}

export function useUpdateCasino(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<Casino>(`/admin/casinos/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["casino", data.id], data);
      qc.setQueryData(["casino", "by-slug", data.slug], data);
      qc.invalidateQueries({ queryKey: ["casinos"] });
      showSuccess("Casino updated");
    },
  });
}

export function usePatchCasinoStatus(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (status: "published" | "draft" | "pending") =>
      api.patch<Casino>(`/admin/casinos/${id}/status`, { status }).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["casino", data.id], data);
      qc.setQueryData(["casino", "by-slug", data.slug], data);
      qc.invalidateQueries({ queryKey: ["casinos"] });
      showSuccess("Status updated");
    },
  });
}

export function useDeleteCasino() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/casinos/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["casinos"] });
      showSuccess("Casino deleted");
    },
  });
}
