import { selector } from "recoil";
import { currentUserState } from "../atoms/CurrentUser";

export const currentUser = selector({
  key: "currentUser",
  get: ({ get }) => {
    const user = get(currentUserState);

    return user;
  },
  set: ({ set }, user) => set(currentUserState, user),
});

// not used
