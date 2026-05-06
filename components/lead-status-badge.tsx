import { cn } from "@/lib/utils"
import { STATUS_LABEL } from "@/lib/constants"
import type { LeadStatus } from "@/lib/types"

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: "bg-secondary text-secondary-foreground border-border",
  CONTACTED: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  QUALIFIED: "bg-chart-2/10 text-chart-2 border-chart-2/30",
  VIEWING: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  NEGOTIATION: "bg-chart-5/10 text-chart-5 border-chart-5/30",
  CLOSED_WON: "bg-chart-2/15 text-chart-2 border-chart-2/40",
  CLOSED_LOST: "bg-destructive/10 text-destructive border-destructive/20",
}

export function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className,
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
