import { useState } from "react";
import { Paper } from "@mui/material";
import LoginPage from "../LoginPage/LoginPage";
import RegisterPage from "../RegisterPage/RegisterPage";

const AuthenticationPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const switchForm = () => setIsLoginView((prev) => !prev);
  return (
    <Paper className="flex flex-col justify-center h-full">
      <LoginPage visible={isLoginView} switchView={switchForm} />
      <RegisterPage visible={!isLoginView} switchView={switchForm} />
    </Paper>
  );
};

export default AuthenticationPage;
