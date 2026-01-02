import { Suspense } from "react";
import { getKajliTruckEntries } from "@/lib/actions/kajli.actions";
import KajliEntryList from "@/components/KajliEntryList";

// 1. Update the type: searchParams is a Promise
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
              Kajli Dashboard
            </h1>
            <p className="text-zinc-400 mt-1">
              Manage truck entries and logistics flow.
            </p>
          </div>
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
