import { prisma } from "@/lib/models";

/** DB に 会話履歴 の保存 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;
    const userId = "user-123"; // 現状固定

    // DB に作成
    const generated = await prisma.conversation.create({
      data: { userId: userId, sessionId: sessionId },
    });

    // conversationIdを返す
    console.log("💽 Conversation generate success!: " + generated?.id);
    return Response.json(generated?.id ?? null, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("💽 prisma Conversation/generate API POST error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
