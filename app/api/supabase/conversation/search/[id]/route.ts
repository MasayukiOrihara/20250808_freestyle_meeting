import { prisma, supabaseClient } from "@/lib/models";
import { ConversationMemory } from "@/lib/types";
import { NextRequest } from "next/server";

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
    const { take } = await req.json();

    // 1. sessionId に一致する conversation を取得
    const { data: conversation, error: convError } = await supabaseClient()
      .from("conversation")
      .select("id, summary")
      .eq("session_id", id)
      .limit(1)
      .single(); // 1件だけ想定されるなら便利

    if (convError || !conversation) {
      return new Response(JSON.stringify(null), { status: 200 });
    }

    // 2. message テーブルから関連メッセージを取得
    const { data: messages, error: msgError } = await supabaseClient()
      .from("message")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(take);

    if (msgError) {
      return new Response(JSON.stringify({ error: msgError.message }), {
        status: 500,
      });
    }

    const conversations: ConversationMemory = {
      id: conversation.id,
      summary: conversation.summary,
      messages,
    };
    return new Response(JSON.stringify(conversations ?? null), {
      status: 200,
    });
  } catch (error) {
    console.log("🔥 supabase Conversation/search API GET error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
