"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TruckRecord } from "@/types";
import { formatDateTime } from "@/lib/utils";
import EditModal from "@/components/EditModal";
import { updateTruckAdmin } from "@/lib/actions/admin.action";
import { Edit, RefreshCw, FileSpreadsheet, Search } from "lucide-react"; // Changed Icon
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// --- HELPER: Duration Calculator ---
const calculateDuration = (inTime: string, outTime?: string | null) => {
  if (!outTime) return { text: "-", color: "text-zinc-600", isLate: false };

  const start = new Date(inTime).getTime();
  const end = new Date(outTime).getTime();
  const diffMs = end - start;

  if (diffMs < 0) return { text: "Error", color: "text-red-500", isLate: true };

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const text = `${hours}h ${minutes}m`;
  const isLate = hours >= 4;
  const color = isLate ? "text-red-400" : "text-green-400";

  return { text, color, isLate };
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

  // --- HANDLER: EXCEL EXPORT ---
  const generateExcel = async () => {
    // 1. Create Workbook and Sheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Night Checking Report");

    // 2. Define Columns (Split Date & Time)
    worksheet.columns = [
      { header: "Truck No", key: "truckNumber", width: 15 },
      { header: "Transporter", key: "transporter", width: 20 },
      // Split In Time
      { header: "In Date", key: "inDate", width: 12 },
      { header: "In Time", key: "inTime", width: 10 },
      // Split Out Time
      { header: "Out Date", key: "outDate", width: 12 },
      { header: "Out Time", key: "outTime", width: 10 },

      { header: "Duration", key: "duration", width: 15 },
      { header: "Paper", key: "paper", width: 10 },
      { header: "Driver", key: "driver", width: 10 },
      { header: "Tarpulin", key: "tarpulin", width: 10 },
      { header: "Remarks", key: "remarks", width: 30 },
    ];

    // 3. Header Styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }; // White text
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" }, // Indigo-600 background
    };

    // 4. Add Data Rows
    records.forEach((record) => {
      const displayOutTime = record.selfOut || record.outTime;
      const duration = calculateDuration(record.inTime, displayOutTime);

      // Helper to split ISO string into Date and Time components
      const parseDateTime = (isoString?: string | null) => {
        if (!isoString) return { date: "-", time: "-" };
        const d = new Date(isoString);
        return {
          date: d.toLocaleDateString("en-GB"), // DD/MM/YYYY
          time: d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }), // 12:00 PM
        };
      };

      const inData = parseDateTime(record.inTime);
      const outData = displayOutTime
        ? parseDateTime(displayOutTime)
        : { date: "ACTIVE", time: "" };

      const row = worksheet.addRow({
        truckNumber: record.truckNumber,
        transporter: record.transporter,
        inDate: inData.date,
        inTime: inData.time,
        outDate: outData.date,
        outTime: outData.time,
        duration: duration.text,
        paper: record.paperStatus ? "Yes" : "No",
        driver: record.driverStatus ? "Yes" : "No",
        tarpulin: record.tarpulinStatus ? "Yes" : "No",
        remarks: record.remarks || "-",
      });

      // 5. Apply Conditional Formatting (Color Logic)
      if (displayOutTime) {
        const durationCell = row.getCell("duration");
        if (duration.isLate) {
          // RED for >= 4 hours (ARGB format)
          durationCell.font = { color: { argb: "FFF87171" }, bold: true };
        } else {
          // GREEN for < 4 hours
          durationCell.font = { color: { argb: "FF4ADE80" }, bold: true };
        }
      }
    });

    // 6. Save File
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    saveAs(blob, `Night_Checking_${currentMonth.replace(" ", "_")}.xlsx`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // Assuming search implementation exists or is passed
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
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

          {/* EXCEL BUTTON */}
          <button
            onClick={generateExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-all text-white shadow-lg shadow-green-900/20"
          >
            <FileSpreadsheet size={16} />
            <span>Export Excel</span>
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
