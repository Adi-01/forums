"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-linear-to-b from-zinc-900 to-black text-zinc-100 text-center">
      <div className="space-y-6 max-w-md animate-in fade-in zoom-in-95 duration-300">
        {/* Large 404 Text */}
        <h1 className="text-9xl font-extrabold text-zinc-800 tracking-widest select-none mb-8">
          404
        </h1>

        <div className="space-y-2 relative -top-6">
          <h2 className="text-2xl font-bold text-white">Page not found</h2>
          <p className="text-zinc-400">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/nightchecking/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-lg shadow-indigo-900/20"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
