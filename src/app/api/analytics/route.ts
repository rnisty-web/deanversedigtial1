import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getClientIp,
  rateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit";

const ANALYTICS_LIMIT = 60;
const ANALYTICS_WINDOW_MS = 60 * 1000;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`analytics:${ip}`, ANALYTICS_LIMIT, ANALYTICS_WINDOW_MS);
    if (!limit.success) {
      return rateLimitResponse(limit.resetAt);
    }

    const body = await request.json();
    const { page_path, event_type = "page_view", session_id } = body;

    if (!page_path) {
      return NextResponse.json({ error: "page_path required" }, { status: 400 });
    }

    const supabase = await createClient();
    await supabase.from("analytics").insert({
      event_type,
      page_path,
      session_id: session_id ?? null,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to track" }, { status: 500 });
  }
}
