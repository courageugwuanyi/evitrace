import type { Objective } from "@/features/home/shared/models";

const DISPLAY_DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDisplayDate(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);
  return DISPLAY_DATE_FORMATTER.format(date);
}

export function formatEvidenceDateParts(input: string | Date): { dayMonth: string; year: string } {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return { dayMonth: String(input), year: "" };
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = String(date.getFullYear());
  return { dayMonth: `${day} ${month}`, year };
}

export function formatObjectiveCode(objective: Pick<Objective, "id" | "competency" | "title">): string {
  if (/^[A-Z]{2,5}-\d{2,6}$/.test(objective.id)) return objective.id;
  const seed = objective.competency || objective.title || "OBJ";
  const prefix = seed
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .replace(/[^A-Z]/g, "")
    .slice(0, 3)
    .padEnd(3, "X");

  const base = objective.id.replace(/-/g, "");
  let checksum = 0;
  for (let i = 0; i < base.length; i += 1) {
    checksum = (checksum + base.charCodeAt(i) * (i + 1)) % 10000;
  }
  return `${prefix}-${String(checksum).padStart(4, "0")}`;
}
