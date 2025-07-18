import { prisma } from "@/lib/models";
import { NextRequest } from "next/server";

/** prisma から保存してた message を sessionidを元に 2件 取り出す */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { take } = await req.json();

    console.log("💽 prisma Message API GET: " + id);

    const latestMessage = await prisma.message.findMany({
      where: {
        conversationId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: take,
    });

    const messages: string[] = latestMessage
      .reverse()
      .map((msg) => `${msg.role}: ${msg.content}`);

    return new Response(JSON.stringify(messages ?? null), {
      status: 200,
    });
  } catch (error) {
    console.log("💽 prisma Message API GET error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
