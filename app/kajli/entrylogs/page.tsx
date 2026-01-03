import { Suspense } from "react";
import Link from "next/link"; // Import Link
import { PlusCircle } from "lucide-react"; // Import Icon
import { getKajliTruckEntries } from "@/lib/actions/kajli.actions";
import KajliEntryList from "@/components/KajliEntryList";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function KajliPage({ searchParams }: PageProps) {
  // 2. Await the params object first
  const params = await searchParams;

  // 3. Now access the properties safely
  const dateParam = params.date;
  const currentDate = dateParam ? new Date(dateParam as string) : new Date();

  // 4. Fetch Data
  const result = await getKajliTruckEntries(currentDate);
  const data = result.success && result.data ? result.data : [];

  return (
    <main className="min-h-screen bg-zinc-950 p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-8">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
              Kajli Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">
              Manage truck entries and logistics flow.
            </p>
          </div>

          {/* --- New Entry Button --- */}
          <Link
            href="/kajli"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-lg shadow-blue-900/20"
          >
            <PlusCircle className="w-4 h-4" />
            New Entry
          </Link>
        </div>

        <Suspense
          fallback={<div className="text-zinc-500">Loading entries...</div>}
        >
          <KajliEntryList data={data} currentDate={currentDate} />
        </Suspense>
      </div>
    </main>
  );
}
