import { supabaseClient } from "@/lib/models";

/** DB に 会話履歴 の保存 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;
    const userId = "user-123"; // 現状固定

    console.log("🔥 Supabase Conversation/generate API POST");

    // DB に作成
    const { data, error } = await supabaseClient()
      .from("conversation")
      .insert([{ user_id: userId, session_id: sessionId }]) // カラム名に合わせる
      .select()
      .single(); // 1件返してほしい場合

    if (error) {
      console.error("❌ insert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    console.log("✅ inserted:", data);
    return new Response(JSON.stringify(data.id ?? null), {
      status: 200,
    });
  } catch (error) {
    console.log("🔥 Supabase Conversation/generate API POST error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
