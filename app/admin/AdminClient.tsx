"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TruckRecord } from "@/types";
import { calculateDuration, formatDateTime } from "@/lib/utils";
import EditModal from "@/components/EditModal";
import { updateTruckAdmin } from "@/lib/actions/admin.action";
import { Edit, RefreshCw, FileSpreadsheet } from "lucide-react";

import ExportModal from "@/components/ExportModal";

export default function AdminClient({
  initialRecords,
}: {
  initialRecords: TruckRecord[];
}) {
  const router = useRouter();
  const [records, setRecords] = useState(initialRecords);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<TruckRecord | null>(null);

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
      {/* Edit Modal */}
      {recordToEdit && (
        <EditModal
          isOpen={isEditModalOpen}
          record={recordToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        records={records}
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-zinc-900/30 p-4 rounded-lg border border-zinc-800">
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-medium transition-all text-zinc-200 border border-zinc-700"
        >
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>

        {/* Single Export Button Trigger */}
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm font-medium transition-all text-white shadow-lg shadow-indigo-900/20"
        >
          <FileSpreadsheet size={16} />
          <span>Export Reports</span>
        </button>
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
