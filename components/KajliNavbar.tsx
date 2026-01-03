"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Warehouse,
  Menu,
  X,
  LogOut,
  Moon,
  PlusIcon,
} from "lucide-react";

type KajliNavbarProps = {
  user: any;
  isAdmin: boolean;
};

export default function KajliNavbar({ user, isAdmin }: KajliNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // Outer Container (Sticky)
    <div className="sticky top-2 z-40 px-4 mt-2 mb-6">
      <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 backdrop-blur flex justify-between items-center max-w-5xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-blue-500" />
          <h1 className="text-xl font-bold text-blue-400">Kajli Logistics</h1>
        </div>

        {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-3">
            {/* 1. Entry Logs */}
            <Link
              href="/kajli/entrylogs"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700/50 transition-colors"
            >
              <ClipboardList size={14} /> Entry Logs
            </Link>

            {/* 2. Godown Summary (Admin Only) */}
            {isAdmin && (
              <Link
                href="/kajli/godownsummary"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 hover:bg-emerald-900/50 transition-colors"
              >
                <Warehouse size={14} /> Godown
              </Link>
            )}

            {/* 3. Night Checking Link */}
            <Link
              href="/nightchecking"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-indigo-400 bg-indigo-950/30 border border-indigo-900/50 hover:bg-indigo-900/50 transition-colors"
            >
              <Moon size={14} /> Night Check
            </Link>
          </nav>

          <div className="h-6 w-px bg-zinc-700"></div>

          <div className="flex items-center gap-3">
            {/* New Entry Button (Context aware - goes to Kajli root) */}
            <Link
              href="/kajli"
              className="flex items-center gap-1 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              New <PlusIcon size={16} />
            </Link>

            {/* Logout is handled via a server action passed from parent or a separate client component. 
                Since this is a client component, we'll assume a simple form submission to a server action route 
                or you can pass the action as a prop like in DashboardClient.
                For now, simple form pointing to your action. */}
            <form action="/auth/logout" method="POST">
              {/* NOTE: You might need to adjust this action path or pass the server action as a prop */}
              <button
                type="submit"
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </form>
          </div>
        </div>

        {/* --- MOBILE HAMBURGER (Visible on Mobile) --- */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-md"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex justify-end">
          <div className="w-[300px] h-full bg-zinc-900 border-l border-zinc-800 p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                Menu{" "}
                <span className="text-xs font-normal text-zinc-500">
                  ({user?.name})
                </span>
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/kajli"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-blue-600 text-white font-medium"
              >
                <PlusIcon size={18} /> New Kajli Entry
              </Link>

              <div className="h-px bg-zinc-800 my-2"></div>

              <Link
                href="/kajli/entrylogs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 bg-zinc-800/30 border border-zinc-800"
              >
                <ClipboardList size={18} /> Entry Logs
              </Link>

              {isAdmin && (
                <Link
                  href="/kajli/godownsummary"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-400 bg-emerald-950/20 border border-emerald-900/30"
                >
                  <Warehouse size={18} /> Godown Summary
                </Link>
              )}

              <Link
                href="/nightchecking"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-indigo-400 bg-indigo-950/20 border border-indigo-900/30"
              >
                <Moon size={18} /> Night Checking
              </Link>

              <div className="mt-auto pt-8">
                <form action="/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-zinc-800 text-red-400 font-medium hover:bg-zinc-700 transition-colors"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
