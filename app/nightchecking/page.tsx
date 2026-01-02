"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusToggle from "@/components/StatusToggle";
import { createTruckEntry } from "@/lib/actions/user.actions";
import {
  ArrowLeft,
  Truck,
  Building2,
  FileText,
  Loader2,
  CheckCircle2,
  Keyboard,
  List,
} from "lucide-react";

export default function EntryPage() {
  const router = useRouter();

  // Form State
  const [truckNumber, setTruckNumber] = useState("");
  const [transporter, setTransporter] = useState("");
  const [isManualTransporter, setIsManualTransporter] = useState(false);

  const [paperStatus, setPaperStatus] = useState<boolean | null>(null);
  const [driverStatus, setDriverStatus] = useState<boolean | null>(null);
  const [tarpulinStatus, setTarpulinStatus] = useState<boolean | null>(null);
  const [remarks, setRemarks] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truckNumber) return alert("Truck Number is required");
    if (!transporter) return alert("Transporter is required");

    setIsSubmitting(true);

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
      setTruckNumber("");
      setTransporter("");
      setIsManualTransporter(false);
      setPaperStatus(null);
      setDriverStatus(null);
      setTarpulinStatus(null);
      setRemarks("");
    } else {
      alert(`Failed to check in: ${response.error}`);
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 bg-zinc-950 text-zinc-100 flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              New Entry
            </h1>
            <p className="text-sm text-zinc-400">
              Record a new vehicle arrival.
            </p>
          </div>
          <Link
            href="/nightchecking/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-zinc-900"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-sm overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {/* Section 1: Vehicle Details */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Truck size={16} /> Vehicle Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Truck Number */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-200">
                    Truck Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={truckNumber}
                    onChange={(e) => setTruckNumber(e.target.value)}
                    placeholder="GJ01XX1234"
                    disabled={isSubmitting}
                    className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all uppercase"
                  />
                </div>

                {/* Transporter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-zinc-200">
                      Transporter <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualTransporter(!isManualTransporter);
                        setTransporter("");
                      }}
                      className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      {isManualTransporter ? (
                        <List size={12} />
                      ) : (
                        <Keyboard size={12} />
                      )}
                      {isManualTransporter ? "Select List" : "Type Manual"}
                    </button>
                  </div>

                  {isManualTransporter ? (
                    <input
                      type="text"
                      value={transporter}
                      onChange={(e) => setTransporter(e.target.value)}
                      placeholder="Enter Name..."
                      disabled={isSubmitting}
                      className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                    />
                  ) : (
                    <div className="relative">
                      <select
                        value={transporter}
                        onChange={(e) => setTransporter(e.target.value)}
                        disabled={isSubmitting}
                        className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer"
                      >
                        <option value="" disabled>
                          Select Transporter
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
                        <option value="SATYAM">SATYAM</option>
                        <option value="YOGESHWAR">YOGESHWAR</option>
                        <option value="SHAKTI">SHAKTI</option>
                        <option value="MARUTI">MARUTI</option>
                        <option value="DIVYADEEP">DIVYADEEP</option>
                        <option value="OWN TRANSPORT">OWN TRANSPORT</option>
                      </select>
                      <Building2 className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-800" />

            {/* Section 2: Checks */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} /> Inspection Checks
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                  label="Tarpaulin Status"
                  value={tarpulinStatus}
                  onChange={setTarpulinStatus}
                />
              </div>
            </div>

            <div className="h-px bg-zinc-800" />

            {/* Section 3: Remarks */}
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={16} /> Additional Notes
              </h2>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Any observations, damage reports, or specific notes..."
                  disabled={isSubmitting}
                  className="flex min-h-[80px] w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-indigo-600 text-white shadow hover:bg-indigo-500 h-10 px-8 py-2 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Submit Entry"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
