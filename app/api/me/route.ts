import { NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite/index";

export async function GET() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    if (!user.labels?.includes("admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
