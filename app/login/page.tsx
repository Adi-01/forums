"use client";

import { useEffect, useState } from "react";
import { loginAction } from "@/lib/actions/user.actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 Check existing session on mount
  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch("/api/me", {
          cache: "no-store",
          credentials: "include",
        });

        if (res.ok) {
          const params = new URLSearchParams(window.location.search);
          const next = params.get("next") || "/nightchecking";

          if (!cancelled) {
            window.location.replace(next);
          }
          return;
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // 🧠 BLOCK UI while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Checking session…</span>
        </div>
      </div>
    );
  }

  // 🔑 Handle login submit
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    const result = await loginAction(email, password);

    if (!result.success) {
      setLoading(false);
      setError(result.error);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/nightchecking";

    window.location.replace(next);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-sm p-8 rounded-2xl"
      >
        <h2 className="text-3xl font-bold text-center text-white">Login</h2>

        {error && (
          <p className="text-red-400 text-sm bg-red-900/30 p-2 rounded-md text-center">
            {error}
          </p>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-white">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-3 py-2 bg-black border border-white/60 text-white rounded-md focus:outline-none focus:border-blue-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-white">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              className="w-full px-3 py-2 bg-black border border-white/60 text-white rounded-md focus:outline-none focus:border-blue-400"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white/90 font-semibold py-2 rounded-md disabled:opacity-50 transition"
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
