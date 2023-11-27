import { PiCaretCircleDoubleDownFill } from "react-icons/pi";
import Message from "../../components/Message/Message";
import { useEffect, useRef, useState } from "react";
import { useLastItemRef } from "../../hooks/useLastItemReft";
import { MessageType } from "../../state/recoil/selectors/MyConversations";

const ConversationPageMessages = ({
  messages,
  showAuthor,
  removeMesssageFromList,
}: {
  messages: MessageType[];
  showAuthor: boolean;
  removeMesssageFromList: (messageId: number) => void;
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollToBottomVisible, setScrollToBottomVisible] = useState(
    Boolean(messages.length)
  );
  const { lastItemRef } = useLastItemRef((visible) =>
    setScrollToBottomVisible(visible)
  );

  const scrollToBottom = () => {
    listRef.current?.lastElementChild?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex relative min-h-0 ">
      <div
        ref={listRef}
        className="flex min-h-0  relative flex-grow overflow-y-auto flex-col p-4 gap-3"
      >
        {messages.map((message, index) => (
          <Message
            ref={index === messages.length - 1 ? lastItemRef : null}
            removeMesssageFromList={removeMesssageFromList}
            key={message.id}
            message={message}
            showAuthor={showAuthor}
          />
        ))}
      </div>
      <PiCaretCircleDoubleDownFill
        className={`absolute ${
          !scrollToBottomVisible ? "hidden" : ""
        } right-10 bottom-5 cursor-pointer text-[#404d55] hover:text-[#55656f]`}
        onClick={scrollToBottom}
        size={36}
      />
    </div>
  );
};

export default ConversationPageMessages;
