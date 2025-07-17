import { prisma } from "@/lib/models";

/** DB に hash の保存 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const hashData = body.hashData;

    console.log("💽 prisma Hash API POST(hash Data)");

    // DB に保存
    await prisma.fileHashGroup.upsert({
      where: { key: "globalHash" }, // 固定キー
      update: { hashes: hashData },
      create: { key: "globalHash", hashes: hashData },
    });

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("💽 prisma Hash API POST error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}

/** prisma から保存してた hash を取り出す */
export async function GET() {
  try {
    console.log("💽 prisma Hash API GET(hash Data)");

    // DB から読み込み
    const group = await prisma.fileHashGroup.findUnique({
      where: { key: "globalHash" },
    });
    const hash: string[] = group?.hashes ?? [];

    return new Response(JSON.stringify(hash), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("💽 prisma Hash API GET error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
