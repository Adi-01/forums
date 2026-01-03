"use client";

import { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import EditModal from "@/components/EditModal";
import { TruckRecord } from "@/types";
import { markTruckExit, updateTruckEntry } from "@/lib/actions/truck.actions";
import { formatDateTime } from "@/lib/utils";
import { updateTruckExitTime } from "@/lib/actions/user.actions";
import {
  PlusIcon,
  LayoutDashboard,
  ShieldCheck,
  Truck,
  Menu, // Hamburger Icon
  X, // Close Icon
  LogOut,
} from "lucide-react";

// Helper: Convert ISO string to input format
const toInputFormat = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export default function DashboardClient({
  initialRecords,
  logoutAction,
  isAdmin,
}: {
  initialRecords: TruckRecord[];
  logoutAction: () => Promise<void>;
  isAdmin: boolean;
}) {
  // -----------------------------
  // Client-only state
  // -----------------------------
  const [records, setRecords] = useState<TruckRecord[]>(initialRecords || []);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<TruckRecord | null>(null);
  const [historyEditingId, setHistoryEditingId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile State

  const activeRecords = records.filter((r) => r.status === "IN");
  const historyRecords = records.filter((r) => r.status === "OUT");

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleEditClick = (record: TruckRecord) => {
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (
    id: string,
    updatedData: Partial<TruckRecord>
  ) => {
    // ... (Keep existing save logic)
    const previousRecords = [...records];
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r))
    );
    const response = await updateTruckEntry({
      documentId: id,
      TruckNumber: updatedData.truckNumber!,
      TransporterName: updatedData.transporter!,
      PaperStatus: updatedData.paperStatus!,
      DriverStatus: updatedData.driverStatus!,
      TarpulinStatus: updatedData.tarpulinStatus!,
      Remarks: updatedData.remarks || "",
    });
    if (!response.success) {
      alert("Update failed: " + response.error);
      setRecords(previousRecords);
    }
  };

  const handleExit = async (id: string) => {
    // ... (Keep existing exit logic)
    const previousRecords = [...records];
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: "OUT", outTime: new Date().toISOString() }
          : r
      )
    );
    const response = await markTruckExit(id);
    if (!response.success) {
      alert("Failed to update status.");
      setRecords(previousRecords);
    }
  };

  const handleTimeUpdate = async (id: string) => {
    // ... (Keep existing time logic)
    if (!tempTime) return;
    const previousRecords = [...records];
    const isoDate = new Date(tempTime).toISOString();
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selfOut: isoDate } : r))
    );
    setHistoryEditingId(null);
    const response = await updateTruckExitTime(id, isoDate);
    if (!response.success) {
      alert("Failed to update time.");
      setRecords(previousRecords);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Edit Modal */}
      {recordToEdit && (
        <EditModal
          isOpen={isEditModalOpen}
          record={recordToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* --- RESPONSIVE NAVBAR --- */}
      <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 backdrop-blur flex justify-between items-center sticky top-2 z-40">
        {/* Logo */}
        <h1 className="text-xl font-bold text-indigo-400">Night Check</h1>

        {/* --- DESKTOP NAVIGATION (Hidden on Mobile) --- */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-3">
            {/* Admin Link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 hover:bg-emerald-900/50 transition-colors"
              >
                <ShieldCheck size={14} /> Admin
              </Link>
            )}

            {/* Kajli Link */}
            <Link
              href="/kajli"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-blue-400 bg-blue-950/30 border border-blue-900/50 hover:bg-blue-900/50 transition-colors"
            >
              <LayoutDashboard size={14} /> Kajli
            </Link>
          </nav>

          <div className="h-6 w-px bg-zinc-700"></div>

          <div className="flex items-center gap-3">
            <Link
              href="/nightchecking"
              className="flex items-center gap-1 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
            >
              New <PlusIcon size={16} />
            </Link>

            <form action={logoutAction}>
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
          {/* Using a custom simple overlay approach if you don't have Shadcn Sheet, 
                but here is the standard React state approach for maximum compatibility */}
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
              <h2 className="text-lg font-bold text-zinc-100">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800/50 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/nightchecking/new"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-indigo-600 text-white font-medium"
              >
                <PlusIcon size={18} /> New Entry
              </Link>

              <div className="h-px bg-zinc-800 my-2"></div>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-400 bg-emerald-950/20 border border-emerald-900/30"
                >
                  <ShieldCheck size={18} /> Admin Panel
                </Link>
              )}

              <Link
                href="/kajli"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-400 bg-blue-950/20 border border-blue-900/30"
              >
                <LayoutDashboard size={18} /> Kajli
              </Link>

              <div className="mt-auto pt-8">
                <form action={logoutAction}>
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

      {/* --- CONTENT (Active Vehicles) --- */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-zinc-200">
          <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
          Inside Premises ({activeRecords.length})
        </h2>

        {activeRecords.length === 0 ? (
          <div className="p-12 text-center bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed text-zinc-500">
            <p>No vehicles currently inside.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeRecords.map((record) => (
              <div
                key={record.id}
                className="bg-zinc-800/80 p-5 rounded-lg border border-zinc-700 shadow-sm flex flex-col gap-4"
              >
                {/* Top Row: Truck Info */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Truck size={18} className="text-zinc-500" />
                        {record.truckNumber}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-zinc-700 text-xs text-zinc-300 hidden sm:inline-block">
                        {record.transporter}
                      </span>
                    </div>
                    {/* Mobile Transporter Badge */}
                    <span className="px-2 py-0.5 rounded bg-zinc-700 text-xs text-zinc-300 inline-block sm:hidden mt-2">
                      {record.transporter}
                    </span>
                    <p className="text-sm text-zinc-400 mt-2 pl-0 sm:pl-7 flex items-center gap-1">
                      In: {formatDateTime(record.inTime)}
                    </p>
                  </div>
                </div>

                {/* Middle Row: Status Badges */}
                <div className="flex gap-2 sm:pl-7 text-xs flex-wrap">
                  <StatusBadge label="Paper" status={record.paperStatus} />
                  <StatusBadge label="Driver" status={record.driverStatus} />
                  <StatusBadge
                    label="Tarpulin"
                    status={record.tarpulinStatus}
                  />
                </div>

                {/* Bottom Row: Actions */}
                <div className="flex items-center gap-3 sm:pl-7 w-full pt-2 border-t border-zinc-700/50 mt-1 sm:border-0 sm:pt-0 sm:mt-0">
                  <button
                    onClick={() => handleEditClick(record)}
                    className="flex-1 sm:flex-none px-4 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded font-medium text-sm transition-colors text-center"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleExit(record.id)}
                    className="flex-1 sm:flex-none px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors shadow-lg shadow-red-900/20 text-center"
                  >
                    Mark OUT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- HISTORY TABLE --- */}
      {historyRecords.length > 0 && (
        <section className="opacity-75 pt-8 border-t border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-zinc-400">
            Recent Activity
          </h2>
          <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400 min-w-[600px]">
                <thead className="bg-zinc-950 text-zinc-200 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-4">Truck No</th>
                    <th className="p-4">In Time</th>
                    <th className="p-4">Out Time</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.map((record) => {
                    const displayTime = record.selfOut || record.outTime;
                    const isEditing = historyEditingId === record.id;
                    const isManual = !!record.selfOut;

                    return (
                      <tr
                        key={record.id}
                        className="border-t border-zinc-800 hover:bg-zinc-800/30"
                      >
                        <td className="p-4 font-medium text-zinc-300">
                          {record.truckNumber}
                        </td>
                        <td className="p-4">{formatDateTime(record.inTime)}</td>
                        <td className="p-4">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="datetime-local"
                                value={tempTime}
                                onChange={(e) => setTempTime(e.target.value)}
                                className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white w-32"
                              />
                              <button
                                onClick={() => handleTimeUpdate(record.id)}
                                className="text-green-500"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setHistoryEditingId(null)}
                                className="text-red-500"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="group flex items-center gap-2">
                              <span
                                className={isManual ? "text-indigo-200" : ""}
                              >
                                {formatDateTime(displayTime!)}
                              </span>
                              <button
                                onClick={() => {
                                  setTempTime(toInputFormat(displayTime));
                                  setHistoryEditingId(record.id);
                                }}
                                className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✎
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-green-300 border border-zinc-700 bg-green-900/20 px-2 py-1 rounded text-xs">
                            OUT
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
