import { useRecoilState, useRecoilValueLoadable } from "recoil";
import {
  ConversationType,
  conversationsQuery,
  conversationsRefreshKeyAtom,
} from "../../state/recoil/selectors/MyConversations";
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  InputBase,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  styled,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { CONVERSATIONS_BASE_PATH } from "../../utils/routes";
import NewConversation from "../../features/NewConversation/NewConversation";
import { IoMdContact, IoMdArrowRoundBack, IoMdCheckmark } from "react-icons/io";
import { MdGroup } from "react-icons/md";
import { LuMessageSquarePlus } from "react-icons/lu";
import { useContext, useEffect, useState } from "react";
import { useCreateNewConversation } from "../../features/NewConversation/useCreateNewConversation";
import { SelectedConversationId } from "../../state/SelectedConversationContext";
import { LoginContext } from "../../state/LoginContext";
import { CiLogout } from "react-icons/ci";
import { existingDirectUserChats } from "../../state/recoil/selectors/Users";

const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
  color: theme.palette.common.white,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

const ConversationsList = ({
  conversations,
}: {
  conversations: ConversationType[];
}) => {
  const navigate = useNavigate();
  const { selectedConversationId, setSelectedConversationId } = useContext(
    SelectedConversationId
  );
  const { currentUser } = useContext(LoginContext);
  return (
    <div className=" overflow-y-auto  flex  flex-col gap-2">
      {conversations?.map((conversation, index: number) => {
        const lastMessage =
          conversation.messages[conversation.messages.length - 1];
        const userChat = conversation.users.find(
          (user) => user.username !== currentUser
        );
        return (
          <div
            className={`flex h-16  ${
              selectedConversationId === conversation.id ? "bg-[#2a3942]" : ""
            } cursor-pointer pt-3  hover:bg-[#2a3942]`}
            key={conversation.id}
            onClick={() => {
              navigate(`${CONVERSATIONS_BASE_PATH}/${conversation.id}`);
              setSelectedConversationId(conversation.id);
            }}
          >
            <Avatar className="self-center w-10 h-10" src="/male.png" />
            <div
              className={`flex-1 min-w-0 flex-grow ${
                index !== conversations.length - 1
                  ? "border-b-2 border-[#2a3942]"
                  : ""
              }`}
            >
              <p className="overflow-hidden  whitespace-nowrap text-ellipsis min-w-0">
                {conversation.name ?? userChat?.username}
              </p>
              <p
                className={`text-xs opacity-70 whitespace-nowrap pb-2 text-ellipsis`}
              >
                {conversation.users.length > 2 && lastMessage
                  ? `~${lastMessage?.user_name}: ${lastMessage?.content}`
                  : lastMessage?.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MainNavigation = () => {
  const { logOut } = useContext(LoginContext);
  const { createConversation } = useCreateNewConversation();
  const conversationsListLoadable = useRecoilValueLoadable(conversationsQuery);
  const [conversationsVisible, setConversationsVisible] = useState(true);
  const [newConversationType, setNewConversationType] = useState<
    "normal" | "group"
  >("normal");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState("");
  const [, setRefreshKey] = useRecoilState(conversationsRefreshKeyAtom);
  const { currentUser } = useContext(LoginContext);
  const [, setExistingUserChats] = useRecoilState(existingDirectUserChats);
  const refetchConversations = () => {
    setRefreshKey((prev) => prev + 1);
    setConversationsVisible(true);
  };

  useEffect(() => {
    if (
      conversationsListLoadable.state === "hasValue" &&
      conversationsListLoadable.contents
    ) {
      const currentDirectUsersChats = conversationsListLoadable.contents
        .filter((conversation) => conversation.users.length === 2)
        .map(
          (conv) =>
            conv.users.find((user) => user.username !== currentUser)?.username
        );
      if (currentDirectUsersChats.length)
        setExistingUserChats(currentDirectUsersChats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationsListLoadable.state, currentUser]);

  return (
    <div className="h-full max-w-sm text-white bg-[#111b21] p-3 flex flex-col">
      <div>
        <div className="flex justify-center">
          {conversationsVisible ? (
            <Button
              className="text-red-600"
              size="large"
              onClick={() => logOut()}
            >
              <CiLogout size={20} />
            </Button>
          ) : undefined}
          <Button
            className="text-white h-[50px]"
            size="large"
            onClick={() => setConversationsVisible((prev) => !prev)}
          >
            {conversationsVisible ? (
              <LuMessageSquarePlus size={20} />
            ) : (
              <IoMdArrowRoundBack size={20} />
            )}
          </Button>
          {!conversationsVisible ? (
            <ToggleButtonGroup
              className="height-full"
              size="large"
              color="primary"
              value={newConversationType}
              exclusive
              onChange={(e, value) => setNewConversationType(value)}
            >
              <CustomToggleButton value="normal">
                <IoMdContact size={20} />
              </CustomToggleButton>
              <CustomToggleButton value="group">
                <MdGroup size={20} />
              </CustomToggleButton>
            </ToggleButtonGroup>
          ) : undefined}
        </div>
        {newConversationType === "group" && selectedUsers.length ? (
          <Paper className="flex items-center my-2">
            <InputBase
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              sx={{ ml: 1, flex: 1 }}
              placeholder="Subject (optional)"
            />
            <Divider sx={{ height: 22, m: 0.5 }} orientation="vertical" />
            <IconButton
              onClick={async () => {
                setGroupName("");
                setSelectedUsers([]);
                setConversationsVisible(true);
                const conversationId = await createConversation(
                  selectedUsers,
                  groupName
                ).then(() => refetchConversations());
                if (typeof conversationId === "number") {
                  setRefreshKey((prev) => prev + 1);
                }
              }}
              color="primary"
              sx={{ p: "10px" }}
              aria-label="directions"
            >
              <IoMdCheckmark size={20} />
            </IconButton>
          </Paper>
        ) : undefined}
      </div>
      {!conversationsVisible ? (
        <NewConversation
          newConversationType={newConversationType}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          setConversationsVisible={() => refetchConversations()}
        />
      ) : undefined}

      {conversationsVisible &&
      conversationsListLoadable.state === "hasValue" &&
      conversationsListLoadable.contents ? (
        <ConversationsList conversations={conversationsListLoadable.contents} />
      ) : undefined}
    </div>
  );
};

export default MainNavigation;
