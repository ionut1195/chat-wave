import { atom } from "recoil";

export type User = {
  username: string;
};
export const currentUserState = atom<string>({
  key: "currentUserState",
  default: undefined,
});
