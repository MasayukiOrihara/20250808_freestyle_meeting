import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { LangChainAdapter } from "ai";

const openAi = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  temperature: 0.8,
  cache: true,
  tags: ["reflect_whiteboard"],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    const currentUserMessage = messages[messages.length - 1].content;

    const prompt = PromptTemplate.fromTemplate(
      "あなたは陽気なAIです。userのメッセージに対して次の文を書かせるような誘導をしてください。\nuser: {user_message}\nassistant: "
    );
    const stream = await prompt.pipe(openAi).stream({
      user_message: currentUserMessage,
    });

    console.log(currentUserMessage);

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    if (error instanceof Error) {
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
