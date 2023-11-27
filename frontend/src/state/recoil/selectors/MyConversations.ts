import {
  GetCallback,
  GetRecoilValue,
  atom,
  selector,
  selectorFamily,
} from "recoil";
import { api } from "../../../services/api";

export type MessageType = {
  content: string;
  conversation_id: number;
  created_at: string;
  id: number;
  user_id: number;
  user_name: string;
};
type UserType = {
  username: string;
};
export type ConversationType = {
  created_at: string;
  id: number;
  messages: MessageType[];
  name: string;
  users: UserType[];
};

// Define a refresh key atom
export const refreshKeyAtom = atom({
  key: "refreshKey",
  default: 0,
});

export const conversationsRefreshKeyAtom = atom({
  key: "conversationsRefreshKey",
  default: 0,
});

export const conversationsQuery = selector({
  key: "MyConversations",
  get: async ({ get }) => {
    get(conversationsRefreshKeyAtom);
    try {
      const response = await api.get("/conversations");
      return response.data as ConversationType[];
    } catch (error) {
      console.log(error);
    }
  },
});

export const conversationByIdQuery = selectorFamily({
  key: "conversationById",
  get:
    (
      id: string | undefined
    ): ((opts: {
      get: GetRecoilValue;
      getCallback: GetCallback;
    }) => Promise<ConversationType>) =>
    async ({ get }) => {
      try {
        get(refreshKeyAtom);
        if (id) {
          const response = await api.get(`/conversation/${id}`);
          return response.data;
        }
      } catch (error) {
        console.log(error);
      }
    },
});
