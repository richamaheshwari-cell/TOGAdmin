"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DashboardResponse } from "@/lib/types";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardResponse>("/admin/dashboard").then((r) => r.data),
  });
}
