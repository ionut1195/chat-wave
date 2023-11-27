import { selector, atom } from "recoil";
import { api } from "../../../services/api";
import { currentUserState } from "../atoms/CurrentUser";

export type User = {
  username: string;
  id: number;
};

export const existingDirectUserChats = atom<(string | undefined)[]>({
  key: "existingDirectUserChats",
  default: [],
});

export const usersQuery = selector({
  key: "Users",
  get: async ({ get }) => {
    const userName = get(currentUserState);
    try {
      const response = await api.get("/users");
      return response.data.filter(
        (user: User) => user.username !== userName
      ) as User[];
    } catch (error) {
      console.log(error);
    }
  },
});
