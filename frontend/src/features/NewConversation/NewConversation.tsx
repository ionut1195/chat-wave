import { useRecoilState, useRecoilValueLoadable } from "recoil";
import {
  existingDirectUserChats,
  usersQuery,
} from "../../state/recoil/selectors/Users";
import { Avatar } from "@mui/material";
import { BsCheckCircleFill } from "react-icons/bs";
import { useCreateNewConversation } from "./useCreateNewConversation";
import { useContext } from "react";
import { LoginContext } from "../../state/LoginContext";

const NewConversation = ({
  newConversationType,
  selectedUsers,
  setSelectedUsers,
  setConversationsVisible,
}: {
  newConversationType: "normal" | "group";
  selectedUsers: number[];
  setSelectedUsers: React.Dispatch<React.SetStateAction<number[]>>;
  setConversationsVisible: () => void;
}) => {
  const { createConversation } = useCreateNewConversation();
  const usersListLoadable = useRecoilValueLoadable(usersQuery);
  const [existingChats] = useRecoilState(existingDirectUserChats);
  const { currentUser } = useContext(LoginContext);

  return (
    <div className="flex min-h-0  flex-col">
      <div className=" overflow-y-auto  flex  flex-col">
        {usersListLoadable.state === "hasValue" && usersListLoadable.contents
          ? usersListLoadable.contents
              .filter((user) =>
                newConversationType === "normal"
                  ? !existingChats.concat(currentUser).includes(user.username)
                  : user.username !== currentUser
              )
              .map((user) => {
                const isSelected = selectedUsers.find(
                  (userId) => userId === user.id
                );
                return (
                  <div
                    className="relative flex h-16 w-full flex-shrink-0 hover:bg-[#2a3942] items-center hover:cursor-pointer"
                    key={user.username + user.id}
                    onClick={async () => {
                      if (newConversationType === "normal") {
                        try {
                          await createConversation([user.id]).then(() =>
                            setConversationsVisible()
                          );
                        } catch (e) {
                          console.log(e);
                        }
                      } else {
                        isSelected
                          ? setSelectedUsers((prev) =>
                              prev.filter((userId) => userId !== user.id)
                            )
                          : setSelectedUsers((prev) => prev.concat(user.id));
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-10 h-10" src="/male.png" />
                      <p className="min-w-0 overflow-hidden text-ellipsis">
                        {user.username}
                      </p>
                    </div>
                    {newConversationType === "group" && isSelected ? (
                      <BsCheckCircleFill className="text-w-green absolute right-5" />
                    ) : undefined}
                  </div>
                );
              })
          : undefined}
      </div>
    </div>
  );
};

export default NewConversation;
