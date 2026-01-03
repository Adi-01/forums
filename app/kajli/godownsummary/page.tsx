import { getCurrentUser } from "@/lib/actions/user.actions";
import { getGodownStockSummary } from "@/lib/actions/kajli.actions"; // The function we fixed earlier
import GodownSummaryClient from "./GodownSummaryClient"; // We will create this next
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GodownSummaryPage() {
  // 1️⃣ Auth Check
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/admin/godown");
  }

  if (!user.labels?.includes("admin")) {
    return <AccessDenied />;
  }

  // 2️⃣ Fetch Data
  const { success, data, error } = await getGodownStockSummary();

  if (!success) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 bg-zinc-950">
        Error loading summary: {error}
      </div>
    );
  }

  // 3️⃣ Render Client Component
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      {/* Pass the initial data as a prop */}
      <GodownSummaryClient initialData={data || []} />
    </main>
  );
}

// --- Internal Access Denied Component ---
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
            You do not have permission to view the Godown Summary.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
