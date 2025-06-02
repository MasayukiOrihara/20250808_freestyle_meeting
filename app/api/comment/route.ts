import { ChatAnthropic } from "@langchain/anthropic";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { LangChainAdapter, Message as VercelChatMessage } from "ai";
import { StringOutputParser } from "@langchain/core/output_parsers";

const ANTHROPIC_MODEL_3_5 = "claude-3-5-haiku-20241022";

// openAI
const openAi = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  model: "gpt-4o",
  temperature: 0.8,
  cache: true,
  tags: ["reflect_whiteboard"],
});

// anthropic(haiku-3.5)(langchain経由)
const haiku3_5 = new ChatAnthropic({
  model: ANTHROPIC_MODEL_3_5,
  apiKey: process.env.ANTHROPIC_API_KEY!,
  maxTokens: 128,
  temperature: 0,
  cache: true,
  tags: ["reflect_whiteboard"],
});
const stringParser = new StringOutputParser();

// 質問内容
const mentorQuestions = [
  "具体的にどんなことがあった？",
  "いつからその問題がある？",
  "関わっている人は誰？",
  "どこで起きた？",
  "その時どんな気持ちだった？",
  "今はどう感じてる？",
  "一番引っかかっていることは何？",
  "どうしたいと思っている？",
  "他にどんな選択肢があると思う？",
  "今すぐできそうなことは何？",
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    const currentUserMessage = messages[messages.length - 1].content;
    const formatMessage = (message: VercelChatMessage) => {
      return `${message.role}: ${message.content}`;
    };
    const formattedPreviousMessages = messages.slice(1).map(formatMessage);
    let prompt = PromptTemplate.fromTemplate(
      "あなたは陽気なAIです。userのメッセージに対して次の文章をかきだせるようなコメントやアドバイスしてください。出力は140文字程度です。\n\nCurrent conversation: ---\n{history}\n---\n\nuser: {user_message}\nassistant: "
    );

    // 悩み相談かどうかの判断
    if (!currentUserMessage.includes("こんにちは")) {
      const judgeTemplate =
        "{question}\n\nこの文章は 悩みや不安からきている相談 ですか？\n「YES」または「NO」のどちらかのみを出力してください。";
      const checkJudgeMentor = await PromptTemplate.fromTemplate(judgeTemplate)
        .pipe(haiku3_5)
        .pipe(stringParser)
        .invoke({ question: currentUserMessage });

      if (checkJudgeMentor.includes("YES")) {
        console.log("💛 悩み相談: " + checkJudgeMentor);
        prompt = PromptTemplate.fromTemplate(
          "あなたは陽気なメンターAIです。userのメッセージに対して、文脈に沿うように以下の Question List から質問文を1つ選んで140文字程度でuserに質問してください。質問は140文字以内です。\n\nCurrent conversation: ---\n{history}\n---\n\nQuestion List: ---\n{question_list}\n---\n\nuser: {user_message}\nassistant: "
        );
      }
    }

    const stream = await prompt.pipe(openAi).stream({
      question_list: mentorQuestions,
      history: formattedPreviousMessages,
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
