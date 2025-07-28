import { supabaseClient } from "@/lib/models";

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

    // 保存エラー
    if (error) {
      console.error("🔥 supabase Upsert failed:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    console.log("🔥 supabase Upsert succeeded!");

    return Response.json(null, {
      status: 204,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("🔥 supabase Hash API POST error" + message);
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
      .single(); // 1件だけ取得する

    // 読み込みエラー: PGRST116 = no rows found
    if (error && error.code !== "PGRST116") {
      console.error("Supabase query error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    const hash: string[] = data?.hashes ?? [];

    return Response.json(hash, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("🔥 supabase Hash API GET error" + message);
    return Response.json({ error: message }, { status: 500 });
  }
}
