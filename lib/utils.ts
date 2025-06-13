import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Message as VercelChatMessage } from "ai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Haiku3_5 } from "./models";

type ClientInstanceType = InstanceType<typeof Client>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 会話履歴をフォーマットする
export const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

// 情報取得するためのMCP処理
export async function getInfoUsingTools(
  client: ClientInstanceType,
  userMessage: string
) {
  let info = "";

  // ツール取得
  const listRes = await client.listTools();
  const availableTools = listRes.tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    schema: tool.inputSchema,
  }));

  // 仕様ツールの推論
  const selectTools = await Haiku3_5.invoke(userMessage, {
    tools: availableTools,
  });

  // 応答処理とツール・コールの処理
  if (selectTools.tool_calls && selectTools.tool_calls.length > 0) {
    for (const tool of selectTools.tool_calls) {
      const result = await client.callTool({
        name: tool.name,
        arguments: tool.args,
      });
      info = JSON.stringify(result.content);
    }
  }
  console.log("[getInfoUsingTools] 取得情報: \n" + info);
  return info;
}
