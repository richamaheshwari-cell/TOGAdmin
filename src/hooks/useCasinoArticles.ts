"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { CasinoArticle, CasinoArticlesListResponse } from "@/lib/types";
import { keepPreviousListData } from "@/lib/queryPagination";

const VISIBILITY_KEYS = [
  "showInBlog",
  "showInGameArticle",
  "showInBonusArticle",
  "showInCasinoArticle",
] as const;

function getErrorText(err: unknown): string {
  const message = (err as { message?: unknown })?.message;
  const details = (err as { details?: { formErrors?: unknown } })?.details;
  const formErrors = Array.isArray(details?.formErrors) ? details.formErrors : [];
  const detailsText = formErrors
    .filter((x): x is string => typeof x === "string")
    .join(" ");

  return [typeof message === "string" ? message : "", detailsText]
    .join(" ")
    .toLowerCase();
}

function hasVisibilityValidationError(err: unknown): boolean {
  const code = (err as { code?: string })?.code;
  const text = getErrorText(err);

  if (code && code !== "VALIDATION_ERROR") return false;
  if (!text.includes("unrecognized keys")) return false;
  return VISIBILITY_KEYS.some((key) => text.includes(key.toLowerCase()));
}

function stripVisibilityKeys(body: Record<string, unknown>) {
  const next = { ...body };
  for (const key of VISIBILITY_KEYS) delete next[key];
  return next;
}

function getVisibilityVariants(body: Record<string, unknown>): Array<Record<string, unknown>> {
  const showInBlog = Boolean(body.showInBlog);
  const showInGameArticle = Boolean(body.showInGameArticle);
  const showInBonusArticle = Boolean(body.showInBonusArticle);
  const showInCasinoArticle = Boolean(body.showInCasinoArticle);

  const stripped = stripVisibilityKeys(body);

  return [
    body,
    {
      ...stripped,
      visibility: {
        showInBlog,
        showInGameArticle,
        showInBonusArticle,
        showInCasinoArticle,
      },
    },
    {
      ...stripped,
      show_in_blog: showInBlog,
      show_in_game_article: showInGameArticle,
      show_in_bonus_article: showInBonusArticle,
      show_in_casino_article: showInCasinoArticle,
    },
    stripped,
  ];
}

async function submitCasinoArticleWithFallback(
  submit: (payload: Record<string, unknown>) => Promise<CasinoArticle>,
  body: Record<string, unknown>
) {
  const variants = getVisibilityVariants(body);

  let lastErr: unknown;
  for (let i = 0; i < variants.length; i += 1) {
    try {
      return await submit(variants[i]);
    } catch (err) {
      lastErr = err;
      if (!hasVisibilityValidationError(err)) throw err;
    }
  }

  throw lastErr;
}

interface ListParams {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}

export function useCasinoArticlesList(params: ListParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.status) searchParams.set("status", params.status);
  if (params.q) searchParams.set("q", params.q);
  const query = searchParams.toString();
  const path = `/admin/casino-articles${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: ["casino-articles", params],
    queryFn: () => api.get<CasinoArticlesListResponse>(path).then((r) => r.data),
    placeholderData: keepPreviousListData,
  });
}

export function useCasinoArticle(id: string | null) {
  return useQuery({
    queryKey: ["casino-article", id],
    queryFn: () => api.get<CasinoArticle>(`/admin/casino-articles/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

/** Resolve an article by slug (for slug-based routes). Uses search then exact slug match. */
export function useCasinoArticleBySlug(slug: string | null) {
  return useQuery({
    queryKey: ["casino-article", "by-slug", slug],
    queryFn: async () => {
      const res = await api.get<CasinoArticlesListResponse>(
        `/admin/casino-articles?q=${encodeURIComponent(slug ?? "")}&limit=50`
      );
      const found = res.data.items.find((a) => a.slug === slug);
      return found ?? null;
    },
    enabled: !!slug,
  });
}

export function useCreateCasinoArticle() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      submitCasinoArticleWithFallback(
        (payload) =>
          api.post<CasinoArticle>("/admin/casino-articles", payload).then((r) => r.data),
        body,
      ),
    onSuccess: (data) => {
      qc.setQueryData(["casino-article", data.id], data);
      qc.invalidateQueries({ queryKey: ["casino-articles"] });
      showSuccess("Article created");
    },
  });
}

export function useUpdateCasinoArticle(id: string) {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      submitCasinoArticleWithFallback(
        (payload) =>
          api
            .put<CasinoArticle>(`/admin/casino-articles/${id}`, payload)
            .then((r) => r.data),
        body,
      ),
    onSuccess: (data) => {
      qc.setQueryData(["casino-article", data.id], data);
      qc.invalidateQueries({ queryKey: ["casino-articles"] });
      showSuccess("Article updated");
    },
  });
}

export function useDeleteCasinoArticle() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<{ deleted: boolean }>(`/admin/casino-articles/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["casino-articles"] });
      showSuccess("Article deleted");
    },
  });
}
