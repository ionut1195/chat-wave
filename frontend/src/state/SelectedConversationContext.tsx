import { createContext, ReactNode, useState } from "react";

export const SelectedConversationId = createContext<{
  selectedConversationId: number;
  setSelectedConversationId: (id: number) => void;
}>({
  selectedConversationId: -1,
  setSelectedConversationId: () => {},
});
const SelectedConversationContext = ({ children }: { children: ReactNode }) => {
  const [conversationId, setConversationId] = useState<number>(-1);

  return (
    <SelectedConversationId.Provider
      value={{
        selectedConversationId: conversationId,
        setSelectedConversationId: (id) => setConversationId(id),
      }}
    >
      {children}
    </SelectedConversationId.Provider>
  );
};

export default SelectedConversationContext;
