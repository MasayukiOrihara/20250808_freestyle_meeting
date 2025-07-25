import { prisma, supabaseClient } from "@/lib/models";

/** DB に hash の保存 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const hashData = body.hashData;

    // DB に保存
    const { data, error } = await supabaseClient()
      .from("file_hash_groups")
      .upsert(
        {
          key: "globalHash",
          hashes: hashData, // hashData は string[] 型
        },
        {
          onConflict: "key", // key列の一意性制約を指定
        }
      );

    if (error) {
      console.error("🔥 supabase Upsert failed:", error);
    } else {
      console.log("🔥 supabase Upsert succeeded!");
    }

    return new Response(null, {
      status: 204,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("🔥 supabase Hash API POST error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}

/** supabase から保存してた hash を取り出す */
export async function GET() {
  try {
    // DB から読み込み
    const { data, error } = await supabaseClient()
      .from("file_hash_groups")
      .select("hashes")
      .eq("key", "globalHash")
      .single(); // ← 1件だけ取得する場合は `.single()` を使う

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      console.error("Supabase query error:", error);
    }

    const hash: string[] = data?.hashes ?? [];

    return new Response(JSON.stringify(hash), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.log("🔥 supabase Hash API GET error" + error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
