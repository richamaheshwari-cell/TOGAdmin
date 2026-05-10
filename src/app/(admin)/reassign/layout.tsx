"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ReassignLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["super_admin", "admin"]}>{children}</ProtectedRoute>;
}
