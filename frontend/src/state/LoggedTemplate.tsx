import { ReactElement, useContext } from "react";
import { LoginContext } from "./LoginContext";

const LoggedTemplate = ({ children }: { children: ReactElement }) => {
  const { isLoggedIn } = useContext(LoginContext);
  return isLoggedIn ? children : null;
};

export default LoggedTemplate;
