"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadStatusBadge } from "@/components/lead-status-badge"
import { ScoreBadge } from "@/components/score-badge"
import { fetcher } from "@/lib/fetcher"
import { formatCurrency, PROPERTY_LABEL, SOURCE_LABEL } from "@/lib/constants"
import type { Lead, LeadStatus } from "@/lib/types"

type FilterTab = "ALL" | "ACTIVE" | "HOT" | LeadStatus

const TABS: { value: FilterTab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "HOT", label: "Hot" },
  { value: "NEW", label: "New" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "VIEWING", label: "Viewing" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CLOSED_WON", label: "Won" },
]

export default function LeadsPage() {
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<FilterTab>("ALL")
  const { data, isLoading } = useSWR<{ leads: Lead[] }>("/api/leads", fetcher)

  const filtered = useMemo(() => {
    let list = data?.leads ?? []
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          (l.email?.toLowerCase().includes(q) ?? false) ||
          l.location.toLowerCase().includes(q),
      )
    }
    if (tab === "ACTIVE") {
      list = list.filter((l) => !["CLOSED_WON", "CLOSED_LOST"].includes(l.status))
    } else if (tab === "HOT") {
      list = list.filter((l) => l.score >= 70 && !["CLOSED_WON", "CLOSED_LOST"].includes(l.status))
    } else if (tab !== "ALL") {
      list = list.filter((l) => l.status === tab)
    }
    return list
  }, [data, search, tab])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto w-full flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All leads visible to you, ordered by score.
          </p>
        </div>
        <Link href="/leads/new">
          <Button>
            <Plus className="size-4" />
            New lead
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, email, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as FilterTab)}>
          <TabsList className="overflow-x-auto max-w-full justify-start">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No leads found. Try adjusting your filters or{" "}
                    <Link href="/leads/new" className="text-foreground underline underline-offset-4">
                      add a new lead
                    </Link>
                    .
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((l) => (
                  <TableRow key={l.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link href={`/leads/${l.id}`} className="hover:underline underline-offset-4">
                        {l.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{l.phone}</div>
                      {l.email && <div className="text-xs">{l.email}</div>}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{PROPERTY_LABEL[l.propertyType]}</div>
                      <div className="text-xs text-muted-foreground">{l.location}</div>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      ₹{formatCurrency(l.budgetMin)} – ₹{formatCurrency(l.budgetMax)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{SOURCE_LABEL[l.source]}</TableCell>
                    <TableCell>
                      <LeadStatusBadge status={l.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <ScoreBadge score={l.score} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {l.assignedToName ?? <span className="italic">Unassigned</span>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
