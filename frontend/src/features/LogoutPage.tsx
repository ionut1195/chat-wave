import React, { useContext, useEffect } from "react";
import { LoginContext } from "../state/LoginContext";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
  const { setIsLoggedIn } = useContext(LoginContext);
  const navigate = useNavigate();
  // the effect is only needed for navigate
  useEffect(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
    setIsLoggedIn(false);
  }, []);

  return <></>;
};

export default LogoutPage;
