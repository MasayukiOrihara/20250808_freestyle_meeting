import { prisma, supabaseClient } from "@/lib/models";
import { MessageMemory } from "@/lib/types";

/** DB に 会話履歴 の保存 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { conversation } = await req.json();

    const messages: MessageMemory[] = conversation.messages;

    // conversation の更新
    const { error: updateError } = await supabaseClient()
      .from("conversation")
      .update({
        summary: conversation.summary,
        ended_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(`conversation update failed: ${updateError.message}`);
    }

    // messages の一括挿入
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

      if (insertError) {
        throw new Error(`message insert failed: ${insertError.message}`);
      }
    }

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("🔥 supabase Conversation/save API POST error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
