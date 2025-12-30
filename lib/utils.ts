import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// --- Helpers ---
export const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true, // Forces AM/PM format even with en-GB locale
  });
};

export function formatVehicleNumber(input: string): string {
  if (!input) return "";
  // 1. Convert to Uppercase
  // 2. Replace all non-alphanumeric characters (spaces, dashes, dots) with empty string
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}
