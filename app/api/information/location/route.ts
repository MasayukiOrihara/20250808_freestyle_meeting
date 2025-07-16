/**
 * 場所を取得する
 * @param req
 * @returns
 */
export async function GET() {
  try {
    // とりあえず固定で指定
    // AIの場所かユーザーの場所か
    // …ふつうはユーザーの場所だろうけどちゃんと所在地のあるAIってのもある意味新しい
    const location = "日本愛知県名古屋市";

    return Response.json(location, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
