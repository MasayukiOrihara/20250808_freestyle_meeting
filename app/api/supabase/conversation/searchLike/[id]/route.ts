import { UNKNOWN_ERROR } from "@/lib/contents";
import { supabaseClient } from "@/lib/models";

/**
 * supabase から保存してた messages を sessionidを元に全件取り出す
 * @param req
 * @param param1
 * @returns
 */
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. sessionId に一致する conversation を取得
    const { data: conversation, error: convError } = await supabaseClient()
      .from("conversation")
      .select("id")
      .like("session_id", `%${id}%`);

    // 取得できなかったらエラー
    if (convError) {
      console.error("❌ conversation select error:", convError?.message);
      return Response.json({ error: convError?.message }, { status: 500 });
    }

    // 0件なら null を返す
    if (conversation === null) {
      console.warn("⚠️ conversation is null");
      return Response.json(null, { status: 200 });
    }

    // conversation の id を複数取得
    const ids = conversation?.map((m) => m.id) ?? [];

    // 2. message テーブルから関連メッセージを取得
    const { data: messages, error: msgError } = await supabaseClient()
      .from("message")
      .select("role, content")
      .in("conversation_id", ids)
      .order("created_at", { ascending: false });

    // 取得できなかったらエラー
    if (msgError) {
      console.error("❌ messages select error:", msgError?.message);
      return Response.json({ error: msgError?.message }, { status: 500 });
    }

    const str: string[] = messages.map((m) => `${m.role}: ${m.content}`);

    return Response.json(str ?? null, {
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🔥 supabase Conversation/search API GET error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
