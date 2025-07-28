import { prisma } from "@/lib/models";
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

    await prisma.$transaction([
      prisma.conversation.update({
        where: { id: id },
        data: { summary: conversation.summary, endedAt: new Date(Date.now()) },
      }),
      prisma.message.createMany({
        data: messages.map((msg) => ({
          conversationId: id,
          role: msg.role,
          content: msg.content,
        })),
      }),
    ]);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("💽 prisma Conversation/save API POST error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
