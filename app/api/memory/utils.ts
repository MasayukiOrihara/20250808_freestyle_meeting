import { BaseMessage } from "@langchain/core/messages";

/** messages を見やすい形式に変換する関数 */
export const formatContent = (messages: BaseMessage[], threadId: string) => {
  const roles = [];
  const contents = [];
  for (const message of messages) {
    const content = String(message.content).replace(/\r?\n/g, "");
    const key = threadId.split("_")[0];

    switch (message.getType()) {
      case "human":
        roles.push("user");
        contents.push(content);
        break;
      case "ai":
        roles.push(`assistant(${key})`);
        contents.push(content);
        break;
      default:
        roles.push(`system`);
        contents.push(content);
    }
  }
  return { roles, contents };
};

export const formatConversation = (roles: string[], contents: string[]) => {
  const conversation = [];
  const length = Math.min(roles.length, contents.length);
  for (let i = 0; i < length; i++) {
    conversation.push(`${roles[i]}: ${contents[i]}`);
  }
  return conversation;
};
