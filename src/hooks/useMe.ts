"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import type { MeProfile } from "@/lib/types";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<MeProfile>("/admin/me").then((r) => r.data),
  });
}

export interface UpdateMeBody {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  profilePublic?: boolean;
  showEmailPublicly?: boolean;
}

function cleanBody(body: UpdateMeBody): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (body.name !== undefined) out.name = body.name;
  if (body.bio !== undefined) out.bio = body.bio;
  if (body.avatarUrl !== undefined) out.avatarUrl = body.avatarUrl;
  if (body.profilePublic !== undefined) out.profilePublic = body.profilePublic;
  if (body.showEmailPublicly !== undefined) out.showEmailPublicly = body.showEmailPublicly;
  return out;
}

export function useUpdateMe() {
  const qc = useQueryClient();
  const { showSuccess } = useToast();
  return useMutation({
    mutationFn: (body: UpdateMeBody) =>
      api.put<MeProfile>("/admin/me", cleanBody(body)).then((r) => r.data),
    onSuccess: (data) => {
      qc.setQueryData(["me"], data);
      showSuccess("Profile updated");
    },
  });
}
