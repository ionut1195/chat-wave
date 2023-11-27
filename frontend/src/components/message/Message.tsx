import React, { useContext } from "react";
import { MessageType } from "../../state/recoil/selectors/MyConversations";
import { TbChevronDown } from "react-icons/tb";
import { Popover } from "@mui/material";
import { api } from "../../services/api";
import { LoginContext } from "../../state/LoginContext";

type PropsType = {
  message: MessageType;
  removeMesssageFromList: (messageId: number) => void;
  showAuthor: boolean;
};
const Message = React.forwardRef<HTMLDivElement, PropsType>((props, ref) => {
  const { message, removeMesssageFromList, showAuthor = false } = props;
  const { currentUser } = useContext(LoginContext);
  const [anchorElement, setAnchorElement] = React.useState<SVGElement | null>(
    null
  );
  const open = Boolean(anchorElement);
  const handleClose = () => {
    setAnchorElement(null);
  };

  return (
    <div
      ref={ref}
      className={`relative flex min-w-0 max-w-full flex-col gap-2 text-white ${
        message.user_name === currentUser
          ? "self-end bg-[#128C7E]"
          : "self-start bg-[#646464]"
      } rounded-lg p-4 m-2`}
    >
      {message.user_name === currentUser ? (
        <div>
          <TbChevronDown
            onClick={(e) => {
              setAnchorElement(e.currentTarget);
            }}
            className="absolute right-4 top-1 hover:scale-150 hover:cursor-pointer ease-in-out transition-transform opacity-50"
          />
          <Popover
            open={open}
            anchorEl={anchorElement}
            onClose={handleClose}
            slotProps={{
              paper: {
                className: "bg-[#202c33] p-5 text-white",
              },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <span
              onClick={() => {
                api
                  .delete(`/message/${message.id}`)
                  .then(() => removeMesssageFromList(message.id));
                setAnchorElement(null);
              }}
              className="opacity-50 hover:cursor-pointer"
            >
              Delete
            </span>
          </Popover>
        </div>
      ) : undefined}
      {showAuthor ? (
        <p className="text-red-400 text-xs">~ {message.user_name}</p>
      ) : undefined}
      <p className="break-words text-lg min-w-0 max-w-full">
        {message.content}
      </p>
      <p className="self-end text-xs opacity-50">
        {message.created_at.slice(0, 16)}
      </p>
    </div>
  );
});

export default Message;
