import type { LeadSource, LeadStatus, PropertyType, Role } from "./types"

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "VIEWING", label: "Viewing" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CLOSED_WON", label: "Closed - Won" },
  { value: "CLOSED_LOST", label: "Closed - Lost" },
]

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: "WEBSITE", label: "Website" },
  { value: "REFERRAL", label: "Referral" },
  { value: "WALK_IN", label: "Walk-in" },
  { value: "PORTAL", label: "Portal Listing" },
  { value: "SOCIAL", label: "Social Media" },
  { value: "COLD_CALL", label: "Cold Call" },
  { value: "OTHER", label: "Other" },
]

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "VILLA", label: "Villa / House" },
  { value: "PLOT", label: "Plot / Land" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "OFFICE", label: "Office Space" },
  { value: "WAREHOUSE", label: "Warehouse" },
]

export const ROLES: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "AGENT", label: "Agent" },
]

export const STATUS_LABEL: Record<LeadStatus, string> = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.value, s.label]),
) as Record<LeadStatus, string>

export const SOURCE_LABEL: Record<LeadSource, string> = Object.fromEntries(
  LEAD_SOURCES.map((s) => [s.value, s.label]),
) as Record<LeadSource, string>

export const PROPERTY_LABEL: Record<PropertyType, string> = Object.fromEntries(
  PROPERTY_TYPES.map((s) => [s.value, s.label]),
) as Record<PropertyType, string>

export function formatCurrency(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000) return `${(n / 100_000).toFixed(2)} L`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}
