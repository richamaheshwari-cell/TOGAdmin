"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminUsersLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["super_admin", "admin"]}>{children}</ProtectedRoute>;
}
