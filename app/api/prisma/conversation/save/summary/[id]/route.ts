import { prisma } from "@/lib/models";
import { use } from "react";

/** DB に 会話履歴の要約 を保存 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { summary } = await req.json();

    console.log("💽 prisma Conversation/save/summary API POST");

    // DB に追加
    await prisma.conversation.update({
      where: { id: id },
      data: { summary: summary },
    });

    // conversationIdを返す
    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("💽 prisma Conversation/save/summary API POST error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
