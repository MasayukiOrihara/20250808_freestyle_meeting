import { prisma } from "@/lib/models";
import { use } from "react";

/** DB に 会話履歴 の保存 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sessionId = body.sessionId;
    const userId = "user-123"; // 現状固定

    console.log("💽 prisma Conversation API POST");

    // DB に作成
    await prisma.conversation.create({
      data: { userId: userId, sessionId: sessionId },
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
