import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getCurrentUserInfo, isExpired } from "../state/LoginContext";
import { createBrowserHistory } from "history";

const API_URL = process.env.REACT_APP_BASE_API_ENDPOINT;

const onRequest = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const storedToken = localStorage.getItem("access_token");
  if (storedToken) {
    config.headers["Authorization"] = `Bearer ${storedToken}`;
  }
  return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  return Promise.reject(error);
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  return response;
};

export const setupInterceptorsTo = (
  axiosInstance: AxiosInstance
): AxiosInstance => {
  axiosInstance.interceptors.request.use(onRequest, onRequestError);
  axiosInstance.interceptors.response.use(onResponse, async (error) => {
    if (error.response) {
      // Access Token was expired
      const data = error.response.data;
      if (
        error.response.status === 401 &&
        data &&
        typeof data === "object" &&
        "detail" in data &&
        data.detail === "Could not validate credentials"
      ) {
        console.log("intercepted?");
        debugger;
        let storedRefreshToken = localStorage.getItem("refresh_token");
        let expired: boolean = false;
        if (storedRefreshToken) {
          const currentUserInfo = getCurrentUserInfo(storedRefreshToken);
          if (isExpired(currentUserInfo?.exp)) expired = true;
        }
        if (!storedRefreshToken || expired) {
          const history = createBrowserHistory();
          history.push("/logout");
        }
        try {
          const rs = await axios.post(`${API_URL}refresh`, {
            refresh_token: storedRefreshToken,
          });

          const { token, user } = rs.data;

          localStorage.setItem("token", JSON.stringify(token));
          localStorage.setItem("user", JSON.stringify(user));
        } catch (_error) {
          return Promise.reject(_error);
        }
      }
    }
    return Promise.reject(error);
  });
  return axiosInstance;
};
