import axios from "axios";
import { setupInterceptorsTo } from "./interceptors";

export const api = setupInterceptorsTo(
  axios.create({
    baseURL: process.env.REACT_APP_BASE_API_ENDPOINT,
    headers: {
      "Content-Type": "application/json",
    },
  })
);
