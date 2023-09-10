import { FieldValues, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormInputText } from "../../components/TextInput";
import { Button, Typography } from "@mui/material";
import { useEffect, useContext } from "react";
import axios from "axios";
import { LoginContext } from "../../state/LoginContext";

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required("Username is required")
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username must not exceed 20 characters"),
  password: Yup.string()
    .required("Password is required")
    .min(3, "Password must be at least 3 characters")
    .max(40, "Password must not exceed 40 characters"),
});

type FormValues = {
  username: string;
  password: string;
};

const defaultValues = {
  username: "",
  password: "",
};

const LoginForm = ({
  switchView,
  visible,
}: {
  switchView: () => void;
  visible: boolean;
}) => {
  const { setIsLoggedIn } = useContext(LoginContext);
  const { handleSubmit, control, setError, resetField } = useForm<FormValues>({
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
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_API_ENDPOINT}token`,
        formData
      );
      console.log(response);
      if (response.data.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        setIsLoggedIn(true);
      }
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }
    } catch (error) {
      setError("password", {
        type: "manual",
        message: "Invalid username or password",
      });
    }
  };
  return (
    <div
      className={`absolute px-20 md:px-0 w-full md:w-[50%] lg:w-[40%] max-w-3xl transition-all duration-500 ease-in-out ${
        visible
          ? "top-[50%] left-[50%] transform translate-x-[-50%] translate-y-[-50%]"
          : "top-[-100%] left-[50%] transform translate-x-[-50%] translate-y-[-50%]"
      }`}
    >
      <form
        className="flex flex-col gap-3 mb-5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormInputText name="username" control={control} label="Username" />
        <FormInputText name="password" control={control} label="Password" />
        <Button
          className="self-center w-[33%]"
          type="submit"
          variant="contained"
        >
          Login
        </Button>
      </form>
      <Typography>
        Don't have an account?{" "}
        <span className="cursor-pointer text-sky-400" onClick={switchView}>
          Register
        </span>
      </Typography>
    </div>
  );
};

export default LoginForm;
