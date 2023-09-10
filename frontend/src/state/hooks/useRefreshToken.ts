import { useContext } from "react";
import { LoginContext } from "../LoginContext";
import axios from "axios";

export const useRefreshToken = () => {
  const { setIsLoggedIn } = useContext(LoginContext);
  const refreshToken = async (refresh_token: string) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_API_ENDPOINT}refresh`,
        { refresh_token: refresh_token }
      );
      if (response.data.access_token) {
        return response.data.access_token;
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };
  return { refreshToken };
};
