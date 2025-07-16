/**
 * 言語を取得する
 * @param req
 * @returns
 */
export async function GET() {
  try {
    // とりあえず固定で指定
    // 事前に指定させる方法が好ましいと思う
    const location = "日本語";

    return Response.json(location, {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
