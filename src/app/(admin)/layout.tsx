"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { NavigationProvider } from "@/contexts/NavigationContext";

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <NavigationProvider>
        <AdminLayout>{children}</AdminLayout>
      </NavigationProvider>
    </ProtectedRoute>
  );
}
