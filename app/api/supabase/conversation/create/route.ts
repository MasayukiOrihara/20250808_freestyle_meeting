import { UNKNOWN_ERROR } from "@/lib/contents";
import { supabaseClient } from "@/lib/models";

/** DB に 会話履歴 の保存 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;
    const userId = "user-123"; // 現状固定

    // DB に作成
    const { data, error } = await supabaseClient()
      .from("conversation")
      .insert([{ user_id: userId, session_id: sessionId }]) // カラム名に合わせる
      .select()
      .single(); // 1件返してほしい場合

    if (error) {
      console.error("❌ conversation insert error:", error?.message);
      return Response.json({ error: error?.message }, { status: 500 });
    }

    console.log("🔥 conversation inserted");
    return Response.json(data?.id ?? null, {
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🔥 Supabase Conversation/generate API POST error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
