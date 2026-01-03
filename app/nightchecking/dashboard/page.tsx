import { getDashboardData } from "@/lib/actions/truck.actions";
import { logout, getCurrentUser } from "@/lib/actions/user.actions"; // ✅ Added getCurrentUser
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export async function logoutAction() {
  "use server";
  await logout();
}

// This is now an ASYNC Server Component
export default async function DashboardPage() {
  // 1. Fetch Data & User Status
  // We can run these in parallel to prevent a waterfall (faster load)
  const [dashboardRes, user] = await Promise.all([
    getDashboardData(),
    getCurrentUser(),
  ]);

  const { success, data, error } = dashboardRes;
  const isAdmin = user?.labels?.includes("admin") || false; // ✅ Calculate Admin Status

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

  // 2. Pass data AND isAdmin to the Client Component
  return (
    <main className="min-h-screen p-6 bg-gradient-to-b from-zinc-900 to-black text-zinc-100">
      <DashboardClient
        initialRecords={data || []}
        logoutAction={logoutAction}
        isAdmin={isAdmin} // ✅ Pass the prop
      />
    </main>
  );
}
