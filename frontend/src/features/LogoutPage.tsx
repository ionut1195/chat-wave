import { useContext } from "react";
import { LoginContext } from "../state/LoginContext";

const LogoutPage = () => {
  // this is used to log the user out when the interceptor cannot refresh the access_token
  const { setIsLoggedIn } = useContext(LoginContext);
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  setIsLoggedIn(false);

  return <></>;
};

export default LogoutPage;
