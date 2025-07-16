/**
 * 日付を取得する
 * @param req
 * @returns
 */
export async function GET() {
  try {
    const now = new Date();

    return Response.json(now.toISOString(), {
      status: 200,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json({ error: message }, { status: 500 });
  }
}
