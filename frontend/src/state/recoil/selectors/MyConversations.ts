import { selector } from "recoil";
import { api } from "../../../services/api";

export const myConversationsQuery = selector({
  key: "MyConversations",
  get: async () => {
    try {
      const response = await api.get("/conversations");
      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
});
