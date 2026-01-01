"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TruckRecord } from "@/types";
import { formatDateTime } from "@/lib/utils";
import EditModal from "@/components/EditModal";
import { updateTruckAdmin } from "@/lib/actions/admin.action";
import { Edit, RefreshCw, FileDown, Search } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- HELPER: Duration Calculator ---
const calculateDuration = (inTime: string, outTime?: string | null) => {
  if (!outTime) return { text: "-", color: "text-zinc-600" };

  const start = new Date(inTime).getTime();
  const end = new Date(outTime).getTime();
  const diffMs = end - start;

  if (diffMs < 0) return { text: "Error", color: "text-red-500" };

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const text = `${hours}h ${minutes}m`;
  const color = hours >= 4 ? "text-red-400" : "text-green-400";

  return { text, color };
};

export default function AdminClient({
  initialRecords,
}: {
  initialRecords: TruckRecord[];
}) {
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<TruckRecord | null>(null);

  // --- HANDLER: REFRESH ---
  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // --- HANDLER: PDF EXPORT ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // 1. Title
    doc.setFontSize(18);
    doc.text(`Night Checking Report - ${currentMonth}`, 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Generated on: ${formatDateTime(new Date().toISOString())}`,
      14,
      28
    );

    // 2. Prepare Data Rows
    const tableRows = records.map((record) => {
      const displayOutTime = record.selfOut || record.outTime;
      const outTimeText = displayOutTime
        ? formatDateTime(displayOutTime)
        : "ACTIVE";

      // Calculate Duration Text
      const durationData = calculateDuration(record.inTime, displayOutTime);

      return [
        record.truckNumber,
        record.transporter,
        formatDateTime(record.inTime),
        outTimeText,
        durationData.text, // Index 4: Duration
        record.paperStatus ? "Yes" : "No",
        record.driverStatus ? "Yes" : "No",
        record.tarpulinStatus ? "Yes" : "No",
        record.remarks || "-",
      ];
    });

    // 3. Generate Table with Custom Colors
    autoTable(doc, {
      startY: 35,
      head: [
        [
          "Truck No",
          "Transporter",
          "Inspection Time",
          "Out Time",
          "Duration",
          "Paper",
          "Driver",
          "Tarpulin",
          "Remarks",
        ],
      ],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
      styles: { fontSize: 8 },

      // ✨ ADDED LOGIC: Color the Duration Column in PDF
      didParseCell: function (data) {
        // Check if we are in the body section and the column is "Duration" (Index 4)
        if (data.section === "body" && data.column.index === 4) {
          const text = data.cell.raw as string;

          // Parse "4h 10m" -> get 4
          const hours = parseInt(text.split("h")[0]);

          if (!isNaN(hours)) {
            if (hours >= 4) {
              // Red Color [R, G, B]
              data.cell.styles.textColor = [248, 113, 113];
            } else {
              // Green Color [R, G, B]
              data.cell.styles.textColor = [74, 222, 128];
            }
          }
        }
      },
    });

    // 4. Save
    doc.save(`Night_Checking_${currentMonth.replace(" ", "_")}.pdf`);
  };

  const handleEditClick = (record: TruckRecord) => {
    setRecordToEdit(record);
    setIsEditModalOpen(true);
  };

  const handleSave = async (id: string, updatedData: Partial<TruckRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedData } : r))
    );

    const res = await updateTruckAdmin(id, updatedData);

    if (!res.success) {
      alert("Failed to update");
      router.refresh();
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {recordToEdit && (
        <EditModal
          isOpen={isEditModalOpen}
          record={recordToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium transition-all text-zinc-200"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium transition-all text-white shadow-lg shadow-indigo-900/20"
          >
            <FileDown size={16} />
            <span>Monthly PDF</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-900 text-zinc-400 uppercase text-xs font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-4 w-32">Truck No</th>
                <th className="p-4 w-40">Transporter</th>
                <th className="p-4 w-40">In Time</th>
                <th className="p-4 w-40">Out Time</th>
                {/* REMOVED COMMENT HERE TO FIX HYDRATION ERROR */}
                <th className="p-4 w-24">Duration</th>
                <th className="p-4 text-center w-24">Paper</th>
                <th className="p-4 text-center w-24">Driver</th>
                <th className="p-4 text-center w-24">Tarpulin</th>
                <th className="p-4">Remarks</th>
                <th className="p-4 text-right w-16">Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {records.map((record) => {
                const displayOutTime = record.selfOut || record.outTime;
                const duration = calculateDuration(
                  record.inTime,
                  displayOutTime
                );

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="p-4 font-bold text-white whitespace-nowrap">
                      {record.truckNumber}
                    </td>
                    <td className="p-4 text-zinc-400 truncate max-w-37.5">
                      {record.transporter}
                    </td>
                    <td className="p-4 whitespace-nowrap text-zinc-400">
                      {formatDateTime(record.inTime)}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {displayOutTime ? (
                        <span className="text-zinc-300">
                          {formatDateTime(displayOutTime)}
                        </span>
                      ) : (
                        <span className="text-yellow-500 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-yellow-900/20 rounded border border-yellow-900/50">
                          Active
                        </span>
                      )}
                    </td>
                    <td
                      className={`p-4 font-medium whitespace-nowrap ${duration.color}`}
                    >
                      {duration.text}
                    </td>
                    <td className="p-4 text-center">
                      <StatusText status={record.paperStatus} />
                    </td>
                    <td className="p-4 text-center">
                      <StatusText status={record.driverStatus} />
                    </td>
                    <td className="p-4 text-center">
                      <StatusText status={record.tarpulinStatus} />
                    </td>
                    <td
                      className="p-4 text-zinc-500 max-w-xs truncate"
                      title={record.remarks}
                    >
                      {record.remarks || "-"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleEditClick(record)}
                        className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded transition-all"
                        title="Edit Entry"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusText({ status }: { status: boolean | null }) {
  if (status === true)
    return <span className="text-green-400 font-medium">Yes</span>;
  if (status === false)
    return <span className="text-red-400 font-medium">No</span>;
  return <span className="text-zinc-600">-</span>;
}
