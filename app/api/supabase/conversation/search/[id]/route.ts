import { supabaseClient } from "@/lib/models";
import { ConversationMemory } from "@/lib/types";

/**
 * supabase から保存してた id と 会話履歴要約 を sessionidを元に取り出す
 * messages も x件 取り出す
 * @param req
 * @param param1
 * @returns
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { count } = await req.json();

    // 1. sessionId に一致する conversation を取得
    const { data: conversation, error: convError } = await supabaseClient()
      .from("conversation")
      .select("id, summary")
      .eq("session_id", id)
      .limit(1)
      .maybeSingle();

    // 取得できなかったらエラー
    if (convError) {
      console.error("❌ conversation select error:", convError.message);
      return Response.json({ error: convError.message }, { status: 500 });
    }

    // 0件なら null を返す
    if (conversation === null) {
      console.warn("△ conversation is null");
      return Response.json(null, { status: 200 });
    }

    // 2. message テーブルから関連メッセージを取得
    const { data: messages, error: msgError } = await supabaseClient()
      .from("message")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(count);

    // 取得できなかったらエラー
    if (msgError) {
      console.error("❌ messages select error:", msgError.message);
      return Response.json({ error: msgError.message }, { status: 500 });
    }

    // 3. 形式を整えて返す
    const conversations: ConversationMemory = {
      id: conversation.id,
      summary: conversation.summary,
      messages,
    };
    return Response.json(conversations ?? null, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("🔥 supabase Conversation/search API GET error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
