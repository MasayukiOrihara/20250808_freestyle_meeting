import { BaseMessage } from "@langchain/core/messages";

export const formattedMessage = (messages: BaseMessage[], threadId: string) => {
  const conversation = [];
  for (const message of messages) {
    const content = String(message.content).replace(/\r?\n/g, "");
    const key = threadId.split("_")[0];

    switch (message.getType()) {
      case "human":
        conversation.push(`user: ${content}`);
        break;
      case "ai":
        conversation.push(`assistant(${key}): ${content}`);
        break;
      default:
        conversation.push(`${content}`);
    }
  }
  return conversation;
};
