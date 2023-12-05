import { useContext } from "react";
import { LoginContext } from "../LoginContext";
import { api } from "../../services/api";

export const useRefreshToken = () => {
  const { logOut } = useContext(LoginContext);
  const refreshToken = async (refresh_token: string) => {
    try {
      const response = await api.post(
        '/refresh',
        { refresh_token: refresh_token }
      );
      if (response.data.access_token) {
        return response.data.access_token;
      }
    } catch (error) {
      logOut();
    }
  };
  return { refreshToken };
};
