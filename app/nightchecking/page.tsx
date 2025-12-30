"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusToggle from "@/components/StatusToggle"; // Adjust path as needed
import { createTruckEntry } from "@/lib/actions/user.actions";

export default function EntryPage() {
  const router = useRouter();

  // Form State
  const [truckNumber, setTruckNumber] = useState("");
  const [transporter, setTransporter] = useState("");
  const [paperStatus, setPaperStatus] = useState<boolean | null>(null);
  const [driverStatus, setDriverStatus] = useState<boolean | null>(null);
  const [tarpulinStatus, setTarpulinStatus] = useState<boolean | null>(null);
  const [remarks, setRemarks] = useState("");

  // UI State for loading feedback
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckNumber) return alert("Truck Number is required");
    if (!transporter) return alert("Transporter is required"); // Added validation

    setIsSubmitting(true);

    // Call the Server Action
    const response = await createTruckEntry({
      TruckNumber: truckNumber,
      TransporterName: transporter,
      PaperStatus: paperStatus,
      DriverStatus: driverStatus,
      TarpulinStatus: tarpulinStatus,
      Remarks: remarks,
    });

    setIsSubmitting(false);

    if (response.success) {
      alert("Vehicle checked in successfully!");

      // Reset form
      setTruckNumber("");
      setTransporter("");
      setPaperStatus(null);
      setDriverStatus(null);
      setTarpulinStatus(null);
      setRemarks("");
    } else {
      alert(`Failed to check in: ${response.error}`);
    }
  };

  return (
    <main className="min-h-screen p-6 bg-linear-to-b from-zinc-900 to-black text-zinc-100 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Navigation Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-400">New Entry</h1>
          <Link
            href="/nightchecking/dashboard"
            className="text-sm text-zinc-400 hover:text-white hover:underline"
          >
            View Dashboard &rarr;
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-800/90 rounded-lg shadow-lg p-6 sm:p-8 space-y-6 border border-zinc-700 backdrop-blur"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-zinc-300">Truck Number</span>
              <input
                value={truckNumber}
                onChange={(e) => setTruckNumber(e.target.value)}
                placeholder="GJ01XX1234"
                disabled={isSubmitting}
                // Added 'h-11' for consistent height
                className="mt-1 h-11 px-3 py-2 rounded bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-zinc-300">Transporter</span>
              <select
                value={transporter}
                onChange={(e) => setTransporter(e.target.value)}
                disabled={isSubmitting}
                className="mt-1 h-11 px-3 py-2 rounded bg-zinc-900 border border-zinc-700 focus:outline-none disabled:opacity-50"
              >
                <option value="" disabled>
                  Select transporter
                </option>
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
                <option value="BHAGIRATH">BHAGIRATH</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatusToggle
              label="Paper Status"
              value={paperStatus}
              onChange={setPaperStatus}
            />
            <StatusToggle
              label="Driver Status"
              value={driverStatus}
              onChange={setDriverStatus}
            />
            <StatusToggle
              label="Tarpulin Status"
              value={tarpulinStatus}
              onChange={setTarpulinStatus}
            />
          </div>

          <label className="flex flex-col">
            <span className="text-sm text-zinc-300">Remarks</span>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Any observation..."
              disabled={isSubmitting}
              className="mt-1 px-3 py-2 rounded bg-zinc-900 border border-zinc-700 focus:outline-none disabled:opacity-50"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-2 rounded text-white font-medium shadow-lg transition-all ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
              }`}
            >
              {isSubmitting ? "Processing..." : "Check In"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
