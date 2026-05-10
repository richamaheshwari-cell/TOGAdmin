"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { Bonus, BonusesListResponse } from "@/lib/types";
import { keepPreviousListData } from "@/lib/queryPagination";

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export function useBonusesList(params: ListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.q) searchParams.set("q", params.q);
  const query = searchParams.toString();
  const path = `/admin/bonuses${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: ["bonuses", params],
    queryFn: () => api.get<BonusesListResponse>(path).then((r) => r.data),
    placeholderData: keepPreviousListData,
  });
}

export function useBonus(id: string | null) {
  return useQuery({
    queryKey: ["bonus", id],
    queryFn: () => api.get<Bonus>(`/admin/bonuses/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useBonusBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["bonus", "by-slug", slug],
    queryFn: async () => {
      const res = await api.get<BonusesListResponse>(
        `/admin/bonuses?q=${encodeURIComponent(slug ?? "")}&limit=50`
      );
      const found = res.data.items.find((b) => b.slug === slug);
      return found ?? null;
    },
    enabled: !!slug,
  });
}

export function useCreateBonus() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.post<Bonus>("/admin/bonuses", body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["bonus", data.id], data);
      qc.invalidateQueries({ queryKey: ["bonuses"] });
      showSuccess("Bonus created");
    },
  });
}

export function useUpdateBonus(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api.put<Bonus>(`/admin/bonuses/${id}`, body).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["bonus", data.id], data);
      qc.invalidateQueries({ queryKey: ["bonuses"] });
      showSuccess("Bonus updated");
    },
  });
}

export function useDeleteBonus() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/bonuses/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bonuses"] });
      showSuccess("Bonus deleted");
    },
  });
}
