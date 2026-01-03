"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ClipboardList,
  Warehouse,
  Menu,
  X,
  User,
  Moon,
} from "lucide-react";

type KajliNavbarProps = {
  user: any;
  isAdmin: boolean;
};

export default function KajliNavbar({ user, isAdmin }: KajliNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Common Links Data
  const navLinks = [
    {
      label: "Entry Logs",
      href: "/kajli/entrylogs",
      icon: <ClipboardList className="h-4 w-4" />,
      adminOnly: false,
    },
    {
      label: "Night Check",
      href: "/nightchecking",
      icon: <Moon className="h-4 w-4" />,
      adminOnly: false,
    },
    {
      label: "Godown Summary",
      href: "/kajli/godownsummary",
      icon: <Warehouse className="h-4 w-4" />,
      adminOnly: true,
    },
  ];

  return (
    <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* --- LOGO --- */}
        <div className="flex items-center gap-2 font-bold text-lg text-zinc-100">
          <LayoutDashboard className="h-5 w-5 text-blue-500" />
          <span>Kajli Logistics</span>
        </div>

        {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            if (link.adminOnly && !isAdmin) return null;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  link.adminOnly
                    ? "text-emerald-400 bg-emerald-950/20 border border-emerald-900/50 hover:bg-emerald-900/40"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}

          {/* User Profile Bubble */}
          {user && (
            <div className="ml-2 pl-4 border-l border-zinc-800 flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full bg-blue-900/30 border border-blue-800 flex items-center justify-center text-xs font-bold text-blue-400"
                title={user.name}
              >
                {user.name?.charAt(0) || "U"}
              </div>
            </div>
          )}
        </div>

        {/* --- MOBILE HAMBURGER (Visible on Mobile) --- */}
        <button
          className="md:hidden p-2 text-zinc-400 hover:text-zinc-100"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* 1. The Backdrop (Dark overlay, click to close) */}
          <div
            className="absolute inset-0 bg-black/60 animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* 2. The Menu Drawer (Solid Background, no blur) */}
          <div className="relative w-[280px] h-full bg-zinc-950 border-l border-zinc-800 p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Mobile Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                {user?.name || "Menu"}
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full border border-zinc-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Links */}
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => {
                if (link.adminOnly && !isAdmin) return null;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border ${
                      link.adminOnly
                        ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30"
                        : "text-zinc-300 bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}

              {/* Mobile Logout Placeholder */}
              <div className="mt-auto pt-8 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">
                  Signed in as {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
