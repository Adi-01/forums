"use client";

import React, { useState, useEffect } from "react";
import StatusToggle from "@/components/StatusToggle";
import { TruckRecord } from "@/types";

type EditModalProps = {
  record: TruckRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updatedData: Partial<TruckRecord>) => Promise<void>;
};

export default function EditModal({
  record,
  isOpen,
  onClose,
  onSave,
}: EditModalProps) {
  // Local state for the form
  const [formData, setFormData] = useState({
    truckNumber: "",
    transporter: "",
    paperStatus: null as boolean | null,
    driverStatus: null as boolean | null,
    tarpulinStatus: null as boolean | null,
    remarks: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load record data when modal opens
  useEffect(() => {
    if (isOpen && record) {
      setFormData({
        truckNumber: record.truckNumber,
        transporter: record.transporter,
        paperStatus: record.paperStatus,
        driverStatus: record.driverStatus,
        tarpulinStatus: record.tarpulinStatus,
        remarks: record.remarks,
      });
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(record.id, formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-zinc-800 bg-zinc-800/50">
          <h2 className="text-lg font-bold text-indigo-400">Edit Entry</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-xs text-zinc-400 mb-1">Truck Number</span>
              <input
                value={formData.truckNumber}
                onChange={(e) =>
                  setFormData({ ...formData, truckNumber: e.target.value })
                }
                className="h-10 px-3 rounded bg-zinc-950 border border-zinc-700 text-sm focus:outline-none focus:border-indigo-500"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-xs text-zinc-400 mb-1">Transporter</span>
              <select
                value={formData.transporter}
                onChange={(e) =>
                  setFormData({ ...formData, transporter: e.target.value })
                }
                className="h-10 px-3 rounded bg-zinc-950 border border-zinc-700 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="AYUSH">AYUSH</option>
                <option value="BVTC">BVTC</option>
                <option value="CTA">CTA</option>
                <option value="RANJIT">RANJIT</option>
                <option value="YADAV">YADAV</option>
                <option value="JYOTI">JYOTI</option>
                <option value="SHIVAM">SHIVAM</option>
                <option value="BALAJI">BALAJI</option>
                <option value="AC">AC</option>
                <option value="NEW SHIV">NEW SHIV</option>
                <option value="KRUPALI">KRUPALI</option>
                <option value="MURLIDHAR">MURLIDHAR</option>
                <option value="SATYAM">SATYAM</option>
                <option value="YOGESHWAR">YOGESHWAR</option>
                <option value="SHAKTI">SHAKTI</option>
                <option value="MARUTI">MARUTI</option>
                <option value="DIVYADEEP">DIVYADEEP</option>
                <option value="OWN TRANSPORT">OWN TRANSPORT</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatusToggle
              label="Paper"
              value={formData.paperStatus}
              onChange={(v) => setFormData({ ...formData, paperStatus: v })}
            />
            <StatusToggle
              label="Driver"
              value={formData.driverStatus}
              onChange={(v) => setFormData({ ...formData, driverStatus: v })}
            />
            <StatusToggle
              label="Tarpulin"
              value={formData.tarpulinStatus}
              onChange={(v) => setFormData({ ...formData, tarpulinStatus: v })}
            />
          </div>

          <label className="flex flex-col">
            <span className="text-xs text-zinc-400 mb-1">Remarks</span>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              rows={3}
              className="p-3 rounded bg-zinc-950 border border-zinc-700 text-sm focus:outline-none focus:border-indigo-500"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-900/20 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
