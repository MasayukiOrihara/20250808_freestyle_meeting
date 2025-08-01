import { UNKNOWN_ERROR } from "@/lib/contents";
import { supabaseClient } from "@/lib/models";
import { MessageMemory } from "@/lib/types";

/** DB に 会話履歴 の保存 */
export async function POST(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = await context.params;
    const { conversation } = await req.json();

    const messages: MessageMemory[] = conversation.messages;

    // 1. conversation の更新
    const { error: updateError } = await supabaseClient()
      .from("conversation")
      .update({
        summary: conversation.summary,
        ended_at: new Date().toISOString(),
      })
      .eq("id", id);

    // 更新エラー
    if (updateError) {
      console.error("❌ conversation update error:", updateError?.message);
      return Response.json({ error: updateError?.message }, { status: 500 });
    }

    // 2. messages の一括挿入
    if (messages.length > 0) {
      const insertData = messages.map((msg) => ({
        conversation_id: id,
        role: msg.role,
        content: msg.content,
        created_at: new Date().toISOString(),
        metadata: null,
      }));

      const { error: insertError } = await supabaseClient()
        .from("message")
        .insert(insertData);

      // 挿入エラー
      if (insertError) {
        console.error("❌ messages insart error:", insertError?.message);
        return Response.json({ error: insertError?.message }, { status: 500 });
      }
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : UNKNOWN_ERROR;

    console.error("🔥 supabase Conversation/save API POST error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
