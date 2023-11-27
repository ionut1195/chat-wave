import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { CONVERSATIONS_BASE_PATH } from "../../utils/routes";

export const useCreateNewConversation = () => {
  const navigate = useNavigate();
  const createConversation = (userIds: number[], conversationName?: string) => {
    return new Promise((resolve, reject) => {
      const conversationObj: { [key: string]: any } = { users: userIds };
      if (conversationName?.length) {
        conversationObj["name"] = conversationName;
      }
      api
        .post("/conversations", conversationObj)
        .then((resp) => {
          const convId = resp.data?.id;
          if (convId) {
            navigate(`${CONVERSATIONS_BASE_PATH}/${convId}`);
            resolve(convId);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
  return { createConversation };
};
