import KajliTruckEntryClient from "@/components/KajliTruckEntryClient";
import { getCurrentUser } from "@/lib/actions/user.actions";
import Link from "next/link";
import {
  Warehouse,
  ClipboardList,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KajliEntryPage() {
  // 1. Fetch User for Permissions
  const user = await getCurrentUser();
  const isAdmin = user?.labels?.includes("admin");

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* --- NAVIGATION BAR --- */}
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo / Title */}
          <div className="flex items-center gap-2 font-bold text-lg text-zinc-100">
            <LayoutDashboard className="h-5 w-5 text-blue-500" />
            <span>Kajli Logistics</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {/* 1. Entry Logs (Visible to Everyone) */}
            {/* Assuming '/admin' is where your main list/table lives based on previous code */}
            <Link
              href="/kajli/entrylogs"
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
            >
              <ClipboardList className="h-4 w-4" />
              Entry Logs
            </Link>

            {/* 2. Godown Summary (ADMIN ONLY) */}
            {isAdmin && (
              <Link
                href="/kajli/godownsummary"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 hover:bg-emerald-900/40 hover:text-emerald-300 transition-all"
              >
                <Warehouse className="h-4 w-4" />
                Godown Summary
              </Link>
            )}

            {/* Optional: User Profile / Logout Indicator */}
            {user && (
              <div className="ml-2 pl-4 border-l border-zinc-800 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-900/30 border border-blue-800 flex items-center justify-center text-xs font-bold text-blue-400">
                  {user.name?.charAt(0) || "U"}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- MAIN ENTRY FORM --- */}
      <main className="flex-1 flex items-center justify-center p-4">
        <KajliTruckEntryClient />
      </main>
    </div>
  );
}
