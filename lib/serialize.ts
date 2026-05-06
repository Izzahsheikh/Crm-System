import type { Lead, LeadDoc, User, UserDoc } from "./types"

export function serializeUser(doc: UserDoc): User {
  return {
    id: doc._id!.toString(),
    email: doc.email,
    name: doc.name,
    role: doc.role,
    active: doc.active,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

export function serializeLead(
  doc: LeadDoc,
  userMap?: Map<string, { name: string }>,
): Lead {
  const assignedToId = doc.assignedTo ? doc.assignedTo.toString() : null
  const createdById = doc.createdBy.toString()
  return {
    id: doc._id!.toString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    source: doc.source,
    propertyType: doc.propertyType,
    budgetMin: doc.budgetMin,
    budgetMax: doc.budgetMax,
    location: doc.location,
    notes: doc.notes,
    status: doc.status,
    score: doc.score,
    assignedTo: assignedToId,
    assignedToName: assignedToId ? userMap?.get(assignedToId)?.name ?? null : null,
    createdBy: createdById,
    createdByName: userMap?.get(createdById)?.name,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    lastContactedAt: doc.lastContactedAt ? doc.lastContactedAt.toISOString() : null,
  }
}
