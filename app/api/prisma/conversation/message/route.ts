import { prisma } from "@/lib/models";

/** DB に 会話履歴 の保存 */
export async function POST(req: Request) {
  try {
    const { conversationId, role, content } = await req.json();

    console.log("💽 prisma Conversation API POST");

    // DB に保存
    await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        // metadata, 追加未定
      },
    });

    // 最終日付の更新
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        endedAt: new Date(Date.now()),
      },
    });

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("💽 prisma Conversation API POST error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
