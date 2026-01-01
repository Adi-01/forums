import { getAllTrucks } from "@/lib/actions/admin.action";
import { getCurrentUser } from "@/lib/actions/user.actions"; // Import the new function
import AdminClient from "./AdminClient";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 1. SECURITY CHECK
  const user = await getCurrentUser();

  // Check if user exists AND has the "admin" label
  const isAdmin = user && user.labels.includes("admin");

  if (!isAdmin) {
    return <AccessDenied />;
  }

  if (!user) {
    // Tell login page to send us back here
    redirect("/login?next=/admin");
  }

  // 2. Fetch Data (Only runs if admin)
  const { success, data, error } = await getAllTrucks();

  if (!success) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-zinc-950">
        Error: {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-bold text-indigo-500">Master Records</h1>
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-sm">
              {data?.length} Entries Found
            </span>
            <span className="px-2 py-1 rounded bg-indigo-900/30 text-indigo-400 text-xs border border-indigo-800">
              Admin Mode
            </span>
          </div>
        </div>

        <AdminClient initialRecords={data || []} />
      </div>
    </main>
  );
}

// --- Access Denied Component (Internal) ---
function AccessDenied() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950 text-zinc-100 text-center">
      <div className="space-y-6 max-w-md animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-center">
          <div className="p-4 bg-red-900/20 rounded-full ring-1 ring-red-900/50">
            <ShieldAlert size={64} className="text-red-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Access Denied</h1>
          <p className="text-zinc-400">
            You do not have the required permissions to view this page. This
            area is restricted to administrators only.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/nightchecking/dashboard"
            className="inline-block w-full sm:w-auto px-8 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
