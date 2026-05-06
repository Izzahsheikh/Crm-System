import { ObjectId } from "mongodb";

// ─── Roles & Enums ────────────────────────────────────────────────────────────

export type Role = "ADMIN" | "MANAGER" | "AGENT"

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "VIEWING" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST"

export type LeadSource = "WEBSITE" | "REFERRAL" | "WALK_IN" | "PORTAL" | "SOCIAL" | "COLD_CALL" | "OTHER" | "FACEBOOK"

export type PropertyType = "APARTMENT" | "VILLA" | "PLOT" | "COMMERCIAL" | "OFFICE" | "WAREHOUSE"

export interface SessionUser {
  id: string
  email: string
  name: string
  role: Role
}

// ─── Database Document Types (what MongoDB stores) ────────────────────────────

export interface UserDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadDoc {
  _id?: ObjectId;
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  location: string;
  budget: number;
  budgetMin: number;
  budgetMax: number;
  source: LeadSource;
  status: LeadStatus;
  priority: "high" | "medium" | "low";
  score: number;
  notes: string;
  assignedTo: ObjectId | null;
  followUpDate: Date | null;
  lastActivityAt: Date;
  createdAt: Date;
}

export interface ActivityLogDoc {
  _id?: ObjectId;
  leadId: ObjectId;
  userId: ObjectId;
  action: "created" | "updated" | "assigned" | "reassigned" | "deleted" | "status_changed" | "notes_updated" | "followup_set";
  oldValue: string;
  newValue: string;
  message: string;
  createdAt: Date;
}

// ─── Frontend/API Types (what we send to the client) ─────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  location: string;
  budget: number;
  budgetMin: number;
  budgetMax: number;
  source: LeadSource;
  status: LeadStatus;
  priority: "high" | "medium" | "low";
  score: number;
  notes: string;
  assignedTo: User | null;
  followUpDate: string | null;
  lastActivityAt: string;
  createdAt: string;
}

export interface ActivityLog {
  _id: string;
  leadId: string;
  userId: User;
  action: string;
  oldValue: string;
  newValue: string;
  message: string;
  createdAt: string;
}

export interface AnalyticsData {
  totalLeads: number;
  activeLeads: number;
  hotLeads: number;
  closedWon: number;
  leadsByStatus: Record<string, number>;
  leadsByPriority: Record<string, number>;
  agentPerformance: Array<{
    agentName: string;
    total: number;
    won: number;
  }>;
  recentLeads: Lead[];
  topLeads: Lead[];
  overdueFollowups: number;
}