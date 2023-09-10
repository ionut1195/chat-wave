import { atom } from "recoil";

export type User = {
  username: string;
  email: string;
};
export const currentUserState = atom<User>({
  key: "currentUserState",
  default: {} as User,
});
