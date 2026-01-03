import KajliTruckEntryClient from "@/components/KajliTruckEntryClient";
import KajliNavbar from "@/components/KajliNavbar"; // Import the new client component
import { getCurrentUser } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

export default async function KajliEntryPage() {
  // 1. Fetch User for Permissions (Server Side)
  const user = await getCurrentUser();
  const isAdmin = user?.labels?.includes("admin") || false;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* 2. Render the Responsive Navbar */}
      <KajliNavbar user={user} isAdmin={isAdmin} />

      {/* 3. Main Entry Form */}
      <main className="flex-1 flex items-center justify-center p-4">
        <KajliTruckEntryClient />
      </main>
    </div>
  );
}
