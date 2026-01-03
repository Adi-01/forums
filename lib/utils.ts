import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to format/sanitize inputs
export function formatVehicleNumber(input: string): string {
  if (!input) return "";
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
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
    hour12: true,
    timeZone: "Asia/Kolkata", // <- ensures same string on server and client
  });
};
const LATE_THRESHOLD_MS = 14700000;

export const calculateDuration = (inTime: string, outTime?: string | null) => {
  if (!outTime)
    return { text: "-", color: "text-zinc-600", isLate: false, diffMs: 0 };

  const start = new Date(inTime).getTime();
  const end = new Date(outTime).getTime();
  const diffMs = end - start;

  if (diffMs < 0)
    return { text: "Error", color: "text-red-500", isLate: true, diffMs: 0 };

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const text = `${hours}h ${minutes}m`;
  const isLate = diffMs > LATE_THRESHOLD_MS;
  const color = isLate ? "text-red-400" : "text-green-400";

  return { text, color, isLate, diffMs };
};
