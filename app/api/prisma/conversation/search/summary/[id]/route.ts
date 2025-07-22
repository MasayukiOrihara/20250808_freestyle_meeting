import { prisma } from "@/lib/models";
import { NextRequest } from "next/server";

/** prisma から保存してた 会話の要約 を sessionidを元に取り出す */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conversation = await prisma.conversation.findFirst({
      where: { id: id },
      select: { summary: true },
    });

    return new Response(JSON.stringify(conversation?.summary ?? null), {
      status: 200,
    });
  } catch (error) {
    console.log("💽 prisma Conversation/search API GET error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
