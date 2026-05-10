"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { keepPreviousListData } from "@/lib/queryPagination";
import type { NewsletterListResponse } from "@/lib/types";

export type NewsletterStatusFilter = "subscribed" | "unsubscribed" | "";

interface ListParams {
  page?: number;
  limit?: number;
  status?: NewsletterStatusFilter;
}

export function useNewsletterList(params: ListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  const query = searchParams.toString();
  const path = `/admin/newsletter${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: ["newsletter", params],
    queryFn: async () => {
      const raw = await api.get<NewsletterListResponse | NewsletterListResponse["items"]>(path).then((r) => r.data);
      if (Array.isArray(raw)) {
        return { items: raw, total: raw.length };
      }
      return raw;
    },
    placeholderData: keepPreviousListData,
  });
}
