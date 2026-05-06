// Calculate lead priority and score from budget (PKR)
export function calculateLeadScore(budget: number): {
  score: number;
  priority: "high" | "medium" | "low";
} {
  if (budget >= 20_000_000) {
    const score = Math.min(100, 90 + Math.floor((budget - 20_000_000) / 5_000_000));
    return { score, priority: "high" };
  } else if (budget >= 10_000_000) {
    const ratio = (budget - 10_000_000) / 10_000_000;
    const score = Math.floor(50 + ratio * 39);
    return { score, priority: "medium" };
  } else {
    const ratio = budget > 0 ? budget / 10_000_000 : 0;
    const score = Math.floor(ratio * 49);
    return { score, priority: "low" };
  }
}

// 15000000 → "1.5 Cr" | 500000 → "5 Lac"
export function formatBudget(budget: number): string {
  if (!budget) return "Not set";
  if (budget >= 10_000_000) return `${(budget / 10_000_000).toFixed(1)} Cr`;
  if (budget >= 100_000) return `${(budget / 100_000).toFixed(0)} Lac`;
  return `PKR ${budget.toLocaleString()}`;
}

// 03001234567 → 923001234567 (WhatsApp format)
export function formatWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "92" + cleaned.slice(1);
  if (cleaned.startsWith("92")) return cleaned;
  return "92" + cleaned;
}