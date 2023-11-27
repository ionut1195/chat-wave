import React, { useContext, useEffect } from "react";
import { Button, Typography } from "@mui/material";
import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormInputText } from "../../components/InputFields/TextInput";
import axios from "axios";
import { useSetRecoilState } from "recoil";
import { currentUserState } from "../../state/recoil/atoms/CurrentUser";
import { LoginContext } from "../../state/LoginContext";

export type FormValues = {
  username: string;
  password: string;
  email: string;
};

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username must not exceed 20 characters"),
  email: Yup.string().required("Email is required").email("Email is invalid"),
  password: Yup.string()
    .required("Password is required")
    .min(3, "Password must be at least 3 characters")
    .max(40, "Password must not exceed 40 characters"),
});

const defaultValues = {
  username: "",
  password: "",
  email: "",
};

const RegisterForm = ({
  switchView,
  visible,
}: {
  switchView: () => void;
  visible: boolean;
}) => {
  const { setIsLoggedIn } = useContext(LoginContext);
  const setUser = useSetRecoilState(currentUserState);
  const { handleSubmit, control, resetField } = useForm<FormValues>({
    defaultValues,
    resolver: yupResolver(validationSchema),
  });
  useEffect(() => {
    return () => {
      if (!visible) {
        for (let key of Object.keys(defaultValues)) {
          resetField(key as keyof FormValues);
        }
      }
    };
  }, [visible, resetField]);
  const onSubmit = async (data: FieldValues) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/users/new",
        data
      );
      if (response.data) {
        const newUser = {
          username: response.data.username,
          email: response.data.email,
        };
        setUser(newUser.username);
        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      className={`absolute px-20 md:px-0 w-full md:w-[50%] lg:w-[40%] max-w-3xl  transition-all duration-500 ease-in-out ${
        visible
          ? "top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%]"
          : "top-[-100%]  left-[50%] transform translate-x-[-50%] translate-y-[-50%]"
      }`}
    >
      <form
        className="flex flex-col gap-3 mb-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormInputText name="username" control={control} label="Username" />
        <FormInputText name="email" control={control} label="Email" />
        <FormInputText name="password" control={control} label="Password" />
        <Button
          className="self-center w-[33%]"
          type="submit"
          variant="contained"
        >
          Register
        </Button>
      </form>
      <Typography>
        Already have an account?{" "}
        <span className="cursor-pointer text-sky-400" onClick={switchView}>
          Login
        </span>
      </Typography>
    </div>
  );
};

export default RegisterForm;
