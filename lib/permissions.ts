import type { Role, SessionUser } from "./types"

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === "ADMIN"
}

export function isManagerOrAbove(user: SessionUser | null): boolean {
  return user?.role === "ADMIN" || user?.role === "MANAGER"
}

export function canViewAllLeads(user: SessionUser | null): boolean {
  return isManagerOrAbove(user)
}

export function canAssignLeads(user: SessionUser | null): boolean {
  return isManagerOrAbove(user)
}

export function canManageUsers(user: SessionUser | null): boolean {
  return isAdmin(user)
}

export function canDeleteLead(user: SessionUser | null): boolean {
  return isManagerOrAbove(user)
}

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  AGENT: "Agent",
}
