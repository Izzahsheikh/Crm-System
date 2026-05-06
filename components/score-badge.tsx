import { cn } from "@/lib/utils"
import { scoreTier } from "@/lib/scoring"

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const tier = scoreTier(score)
  const styles =
    tier === "HOT"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : tier === "WARM"
        ? "bg-chart-4/10 text-chart-4 border-chart-4/30"
        : "bg-secondary text-muted-foreground border-border"
  const label = tier === "HOT" ? "Hot" : tier === "WARM" ? "Warm" : "Cold"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums",
        styles,
        className,
      )}
      title={`${label} lead — score ${score}/100`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {score}
    </span>
  )
}
