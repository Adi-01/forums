import React from "react";
import { getDashboardData } from "@/lib/actions/truck.actions";
import DashboardClient from "./DashboardClient";

// This is now an ASYNC Server Component
export default async function DashboardPage() {
  // 1. Fetch data directly on the server
  // No useEffect, no loading state needed (server waits for data)
  const { success, data, error } = await getDashboardData();

  if (!success) {
    return (
      <main className="min-h-screen p-6 bg-zinc-950 text-red-400 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Error loading dashboard</h2>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  // 2. Pass data to the Client Component
  return (
    <main className="min-h-screen p-6 bg-linear-to-b from-zinc-900 to-black text-zinc-100">
      <DashboardClient initialRecords={data || []} />
    </main>
  );
}
