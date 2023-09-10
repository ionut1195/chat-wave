import React, { createContext, useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import { useRefreshToken } from "./hooks/useRefreshToken";

export const getCurrentUserInfo = (token: string) => {
  try {
    const decoded: {
      sub?: string;
      exp?: number;
    } = jwtDecode(token);

    if (decoded) {
      return decoded;
    }
  } catch (error) {
    console.log(error);
  }
};

export const isExpired = (timestamp: number | undefined): boolean => {
  const currentTimestamp = Date.now() / 1000;

  return timestamp ? timestamp < currentTimestamp : false;
};

export type LoginContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  currentUser: string | undefined;
};

export const LoginContext = createContext({} as LoginContextType);
LoginContext.displayName = "LoginContext";
const LoginContextProvider = ({ children }: { children: React.ReactNode }) => {
  const { refreshToken } = useRefreshToken();
  const [isLogged, setIsLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>();

  useEffect(() => {
    (async function () {
      const storedToken = localStorage.getItem("access_token");
      if (storedToken) {
        const currentUserInfo = getCurrentUserInfo(storedToken);
        setCurrentUser(currentUserInfo?.sub);
        if (currentUserInfo?.exp) {
          if (isExpired(currentUserInfo?.exp)) {
            const storedRefreshToken = localStorage.getItem("refresh_token");
            if (storedRefreshToken) {
              await refreshToken(storedRefreshToken)
                .then((access_token) => {
                  localStorage.setItem("access_token", access_token);
                })
                .catch((err) => {
                  setIsLogged(false);
                });
            }
          }
          setIsLogged(true);
        }
      }
    })();
  }, []);

  return (
    <LoginContext.Provider
      value={{
        isLoggedIn: isLogged,
        setIsLoggedIn: (value: boolean) => setIsLogged(value),
        currentUser: currentUser,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default LoginContextProvider;
