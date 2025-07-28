import { prisma } from "@/lib/models";

/**
 * prisma から保存してた id と 会話履歴要約 を sessionidを元に取り出す
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

    const conversation = await prisma.conversation.findFirst({
      where: { sessionId: id },
      select: {
        id: true, // conversation id (session Id はほぼ一意なので使わない可能性あり)
        summary: true, // 会話履歴要約
        messages: {
          orderBy: { createdAt: "desc" }, // 並び順
          select: {
            role: true,
            content: true,
          },
          take: take,
        },
      },
    });

    return Response.json(conversation ?? null, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("💽 prisma Conversation/search API GET error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
