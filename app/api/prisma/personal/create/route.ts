import { prisma } from "@/lib/models";
import { HumanProfile } from "@prisma/client";

type ExtendedHumanProfile = HumanProfile & { sessionId: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const humanProfile = body.data;
    const sessionId = body.threadId ?? "";

    // セッションIDでデータを管理
    const data: ExtendedHumanProfile = {
      ...humanProfile,
      sessionId: sessionId,
    };

    await prisma.humanProfile.create({
      data: data,
    });

    console.log("💽 human personal create success! ");
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    if (error instanceof Error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";

      console.error("💽 prisma Conversation/personal API GET error" + message);
      return Response.json({ error: message }, { status: 500 });
    }
  }
}
