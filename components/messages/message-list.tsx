import { useMessages } from "./message-provider";

export const MessageList = () => {
  const { messages } = useMessages();

  return (
    <div className="mb-2">
      {messages.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
    </div>
  );
};
