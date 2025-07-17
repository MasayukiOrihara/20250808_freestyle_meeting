import { prisma } from "@/lib/models";
import { HumanProfile } from "@prisma/client";

type ExtendedHumanProfile = HumanProfile & { sessionId: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const humanProfile = body.analyzeData;
    const sessionId = body.threadId ?? "";

    console.log("💽 prisma API");

    // セッションIDでデータを管理
    const data: ExtendedHumanProfile = {
      ...humanProfile,
      sessionId: sessionId,
    };

    const humanProfilePrisma = await prisma.humanProfile.create({
      data: data,
    });
    console.log("💽 prisma data");
    console.log(humanProfilePrisma);

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log("💽 prisma API error" + error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
