import { useRecoilValueLoadable } from "recoil";
import {
  MessageType,
  conversationByIdQuery,
} from "../../state/recoil/selectors/MyConversations";
import { useParams } from "react-router-dom";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { IoSendSharp } from "react-icons/io5";
import { CircularProgress } from "@mui/material";
import { SelectedConversationId } from "../../state/SelectedConversationContext";
import ConversationPageMessages from "./ConversationPageMessages";

const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();
  const conversation = useRecoilValueLoadable(conversationByIdQuery(id));
  const [text, setText] = useState<string>("");
  const [textAreaHeight, setTextAreaHeight] = useState(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { setSelectedConversationId } = useContext(SelectedConversationId);
  const [processedMessages, setProcessedMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    if (id) {
      setSelectedConversationId(+id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let socket = useMemo(() => {
    if (conversation.state === "hasValue") {
      const conversation_id = conversation.contents?.id;
      return new WebSocket(
        `ws://localhost:8000/conversation/${conversation_id}/ws`
      );
    }
  }, [conversation]);

  if (socket) {
    socket.onclose = function (event) {
      setTimeout(function () {
        socket = new WebSocket("ws://localhost:8000");
      }, 5000);
    };
    socket.onopen = () => {
      const token = localStorage.getItem("access_token");
      socket?.send(JSON.stringify({ token: token }));
    };
  }

  const sendMessage = (text: string) => {
    const message = { message: text };
    socket?.send(JSON.stringify(message));
    setText("");
  };

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        event.data &&
          setProcessedMessages((prev) => prev.concat(JSON.parse(event.data)));
      };
    }
  }, [socket]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      setTextAreaHeight(height);
    });
    if (textAreaRef.current) {
      resizeObserver.observe(textAreaRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (conversation.state === "hasValue") {
      setProcessedMessages(conversation.contents.messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.state]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage(text);
    }
  };

  return (
    <div className="flex flex-col w-[80%] justify-between h-full bg-color-bg">
      {conversation.state === "hasValue" ? (
        <ConversationPageMessages
          removeMesssageFromList={(id) =>
            setProcessedMessages((prev) =>
              prev.filter((message) => message.id !== id)
            )
          }
          messages={processedMessages}
          showAuthor={conversation.contents.users.length > 2}
        />
      ) : (
        <CircularProgress className="self-center my-auto" />
      )}
      <div
        style={{ height: 24 + (textAreaHeight > 0 ? textAreaHeight : 24) }}
        className="bg-[#202c33] max-h-max flex items-center justify-center w-full gap-3 py-3"
      >
        <TextareaAutosize
          ref={textAreaRef}
          className="bg-[#2a3942] w-[90%] text-white rounded-lg"
          maxRows={4}
          value={text}
          onKeyDown={handleKeyPress}
          style={{ resize: "none" }}
          onChange={(e) => setText(e.target.value)}
        />
        <IoSendSharp
          className={`transition-opacity duration-500 ${
            text?.length ? "visible opacity-100" : "invisible opacity-0"
          } text-[#128C7E] active:text-[#075E54] hover:text-[#075E54] cursor-pointer `}
          onClick={() => sendMessage(text)}
        />
      </div>
    </div>
  );
};
export default ConversationPage;
