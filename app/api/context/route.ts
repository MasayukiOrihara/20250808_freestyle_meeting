/* * コンテキストを作成し取得する
 * @param req
 * @returns
 */
export async function GET() {
  try {
    console.log("🧻 コンテキスト");

    // 情報収集
    const now = new Date();
    const japanTimeString = now.toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
    });
    const location = "日本-愛知県-名古屋市";
    const language = "日本語";

    // コンテキスト作成
    const data: string[] = [];
    data.push("以下はあなたの設定です。");
    data.push(`今の日時は ${japanTimeString} です。`);
    data.push(`あなたの現在地は ${location} です。`);
    data.push(`あなたは ${language} を話します。`);
    const context: string = data.join("\n");

    return Response.json(context, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
