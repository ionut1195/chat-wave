import { useState } from "react";
import { Paper } from "@mui/material";
import LoginForm from "../../LoginForm/LoginForm";
import RegisterForm from "../../RegisterForm/RegisterForm";

const AuthenticationPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const switchForm = () => setIsLoginView((prev) => !prev);

  return (
    <Paper className="flex flex-col justify-center h-full">
      <LoginForm visible={isLoginView} switchView={switchForm} />
      <RegisterForm visible={!isLoginView} switchView={switchForm} />
    </Paper>
  );
};

export default AuthenticationPage;
