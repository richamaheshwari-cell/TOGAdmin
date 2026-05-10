import type { AdminRole } from "./types";

/** super_admin and admin may edit/delete any content; editors are limited to own items. */
export function isFullContentAccessRole(role: AdminRole | undefined | null): boolean {
  return role === "super_admin" || role === "admin";
}

/**
 * List/detail actions: full-access roles see edit/delete for all rows;
 * editor and seo_editor only for items they created.
 */
export function canEditOwnedContent(
  role: AdminRole | undefined | null,
  currentUserId: string | undefined,
  createdById: string | undefined | null
): boolean {
  if (isFullContentAccessRole(role)) return true;
  if (!currentUserId) return false;
  return Boolean(createdById && createdById === currentUserId);
}
