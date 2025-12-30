"use client";

import React, { useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import EditModal from "@/components/EditModal"; // Import the modal
import { TruckRecord } from "@/types";
import {
  markTruckExit,
  updateTruckEntry, // Import the new server action
} from "@/lib/actions/truck.actions";
import { formatDateTime } from "@/lib/utils";
import { updateTruckExitTime } from "@/lib/actions/user.actions";
import { PlusIcon } from "lucide-react";

// Helper: Convert ISO string to input format
const toInputFormat = (isoString?: string) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export default function DashboardClient({
  initialRecords,
}: {
  initialRecords: TruckRecord[];
}) {
  const [records, setRecords] = useState<TruckRecord[]>(initialRecords);

  // State for Editing Active Record
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<TruckRecord | null>(null);

  // State for Editing History Time
  const [historyEditingId, setHistoryEditingId] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState("");

  const activeRecords = records.filter((r) => r.status === "IN");
  const historyRecords = records.filter((r) => r.status === "OUT");

  // --- HANDLER: OPEN EDIT MODAL ---
  const handleEditClick = (record: TruckRecord) => {
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  // --- HANDLER: SAVE EDITED DATA (Server Action) ---
  const handleSaveEdit = async (
    id: string,
    updatedData: Partial<TruckRecord>
  ) => {
    const previousRecords = [...records];

    // 1. Optimistic Update
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r))
    );

    // 2. Call Server
    const response = await updateTruckEntry({
      documentId: id,
      TruckNumber: updatedData.truckNumber!,
      TransporterName: updatedData.transporter!,
      PaperStatus: updatedData.paperStatus!,
      DriverStatus: updatedData.driverStatus!,
      TarpulinStatus: updatedData.tarpulinStatus!,
      Remarks: updatedData.remarks || "",
    });

    // 3. Rollback if failed
    if (!response.success) {
      alert("Update failed: " + response.error);
      setRecords(previousRecords);
    }
  };

  // --- HANDLER: MARK OUT (Existing) ---
  const handleExit = async (id: string) => {
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

  // --- HANDLER: UPDATE HISTORY TIME (Existing) ---
  const handleTimeUpdate = async (id: string) => {
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Edit Modal (Hidden unless open) */}
      {recordToEdit && (
        <EditModal
          isOpen={isEditModalOpen}
          record={recordToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 backdrop-blur">
        <h1 className="text-2xl font-bold text-indigo-400">Dashboard</h1>
        <Link
          href="/nightchecking"
          className=" flex flex-row justify-between items-center gap-1 mt-4 sm:mt-0 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          New Entry <PlusIcon size={18} />
        </Link>
      </div>

      {/* Active Vehicles Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
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
                className="bg-zinc-800/80 p-5 rounded-lg border border-zinc-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">
                      {record.truckNumber}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-zinc-700 text-xs text-zinc-300">
                      {record.transporter}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">
                    {formatDateTime(record.inTime)}
                  </p>
                  <div className="flex gap-2 mt-2 text-xs">
                    <StatusBadge label="Paper" status={record.paperStatus} />
                    <StatusBadge label="Driver" status={record.driverStatus} />
                    <StatusBadge
                      label="Tarpulin"
                      status={record.tarpulinStatus}
                    />
                  </div>
                </div>

                {/* BUTTON GROUP */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => handleEditClick(record)}
                    className="px-4 py-2 border border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white rounded font-medium text-sm transition-colors"
                  >
                    Edit
                  </button>

                  {/* MARK OUT BUTTON */}
                  <button
                    onClick={() => handleExit(record.id)}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors shadow-lg shadow-red-900/20"
                  >
                    Mark OUT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* History Table (Unchanged Logic, just simplified JSX for brevity) */}
      {historyRecords.length > 0 && (
        <section className="opacity-75 pt-8 border-t border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-zinc-400">
            Recent Activity
          </h2>
          <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-400">
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
                                className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white w-40"
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
                                className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-indigo-400"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                </svg>
                              </button>
                              {isManual && (
                                <span className="text-[9px] bg-indigo-900/50 text-indigo-300 px-1 rounded ml-1">
                                  EDITED
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="text-green-300 border border-zinc-700 px-2 py-1 rounded text-xs">
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
