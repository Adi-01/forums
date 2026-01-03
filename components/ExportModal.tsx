import { TruckRecord } from "@/types";
import { useState } from "react";
import ExcelJS from "exceljs";
import { calculateDuration } from "@/lib/utils";
import { saveAs } from "file-saver";
import { Calendar, Clock, Download, FileSpreadsheet, X } from "lucide-react";

// --- COMPONENT: EXPORT MODAL ---
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: TruckRecord[];
}

export default function ExportModal({
  isOpen,
  onClose,
  records,
}: ExportModalProps) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const processExcel = async (
    data: TruckRecord[],
    filename: string,
    title: string
  ) => {
    setIsProcessing(true);
    try {
      if (data.length === 0) {
        alert("No records found for this criteria.");
        setIsProcessing(false);
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      // Columns
      worksheet.columns = [
        { header: "Truck No", key: "truckNumber", width: 15 },
        { header: "Transporter", key: "transporter", width: 20 },
        { header: "In Date", key: "inDate", width: 12 },
        { header: "In Time", key: "inTime", width: 10 },
        { header: "Out Date", key: "outDate", width: 12 },
        { header: "Out Time", key: "outTime", width: 10 },
        { header: "Duration", key: "duration", width: 15 },
        { header: "Paper", key: "paper", width: 10 },
        { header: "Driver", key: "driver", width: 10 },
        { header: "Tarpulin", key: "tarpulin", width: 10 },
        { header: "Remarks", key: "remarks", width: 30 },
      ];

      // Header Style
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" }, // Indigo
      };

      // Add Data
      data.forEach((record) => {
        const displayOutTime = record.selfOut || record.outTime;
        const duration = calculateDuration(record.inTime, displayOutTime);

        const parseDateTime = (iso?: string | null) => {
          if (!iso) return { date: "-", time: "-" };
          const d = new Date(iso);
          return {
            date: d.toLocaleDateString("en-GB"),
            time: d.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }),
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

        // Conditional Formatting
        if (displayOutTime) {
          const cell = row.getCell("duration");
          cell.font = {
            color: { argb: duration.isLate ? "FFF87171" : "FF4ADE80" },
            bold: true,
          };
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `${filename}.xlsx`);
    } catch (error) {
      console.error(error);
      alert("Error generating Excel");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- FILTER LOGIC ---
  const handleExportDaily = () => {
    const targetDate = new Date(selectedDate).toDateString();
    const filtered = records.filter(
      (r) => new Date(r.inTime).toDateString() === targetDate
    );
    processExcel(filtered, `Daily_Report_${selectedDate}`, "Daily Report");
  };

  const handleExportDailyLate = () => {
    const targetDate = new Date(selectedDate).toDateString();
    const filtered = records.filter((r) => {
      const isSameDay = new Date(r.inTime).toDateString() === targetDate;
      const displayOutTime = r.selfOut || r.outTime;
      const { isLate } = calculateDuration(r.inTime, displayOutTime);
      return isSameDay && isLate;
    });
    processExcel(filtered, `Late_Report_${selectedDate}`, "Late Report");
  };

  const handleExportAll = () => {
    processExcel(records, "All_Data_Dump", "Master Report");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-900/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="text-green-500" /> Export Options
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Section 1: Date Selection */}
          <div className="space-y-2">
            <label className="text-xs uppercase font-semibold text-zinc-500 tracking-wider">
              Select Date for Daily Reports
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-indigo-300 text-white p-3 rounded-lg border border-zinc-800 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Section 2: Daily Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExportDaily}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all group"
            >
              <Calendar className="text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-zinc-200">
                Daily Report
              </span>
            </button>

            <button
              onClick={handleExportDailyLate}
              disabled={isProcessing}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-800 hover:bg-red-900/20 border border-zinc-700 hover:border-red-900/50 rounded-lg transition-all group"
            >
              <Clock className="text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-zinc-200">
                Late Report
              </span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500">Or</span>
            </div>
          </div>

          {/* Section 3: Bulk Action */}
          <button
            onClick={handleExportAll}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-green-900/20 border border-zinc-700 hover:border-green-900/50 text-zinc-300 hover:text-green-400 rounded-lg transition-all"
          >
            <Download size={18} />
            <span className="font-medium">Export All Database Records</span>
          </button>
        </div>
      </div>
    </div>
  );
}
