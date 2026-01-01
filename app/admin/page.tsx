import { getAllTrucks } from "@/lib/actions/admin.action";
import { getCurrentUser } from "@/lib/actions/user.actions"; // Import the new function
import AdminClient from "./AdminClient";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  // 1️⃣ If not logged in → login
  if (!user) {
    redirect("/login?next=/admin");
  }

  // 2️⃣ If logged in but not admin → deny
  if (!user.labels?.includes("admin")) {
    return <AccessDenied />;
  }

  // 3️⃣ Only admins reach here
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
      <AdminClient initialRecords={data || []} />
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
