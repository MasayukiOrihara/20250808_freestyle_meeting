import { supabaseClient } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const humanProfile = body.analyzeData;
    const sessionId = body.threadId ?? "";

    // 1. Supabaseのテーブルに合う形式で整形
    const data = {
      ...humanProfile,
      session_id: sessionId, // Prisma の sessionId → Supabase の session_id に変換
    };

    // 2. データを Supabase に挿入
    const { error } = await supabaseClient()
      .from("human_profile")
      .insert([data]);

    // 挿入エラー
    if (error) {
      console.error("❌ human profile insart error:", error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log("🔥 supabase insert success");

    return new Response(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("🔥 supabase Hash API GET error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
