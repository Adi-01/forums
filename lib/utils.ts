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
