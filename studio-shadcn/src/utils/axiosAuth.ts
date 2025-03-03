import axios from "axios";
import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";

function createAxiosAuthMiddleware(): Middleware {
  return ({ getState }) =>
    (next) =>
    (action) => {
      const state = getState() as RootState;

      // Get token from localStorage first
      const sessionToken = localStorage.getItem("sessionToken");

      // Get stored space ID from localStorage as fallback
      const storedSpaceId = localStorage.getItem("space");

      const spaceId = state.spaces?.selected || storedSpaceId || "";
      axios.defaults.headers.common["X-Space"] = spaceId;

      // Set auth token if available
      if (sessionToken) {
        axios.defaults.headers.common.Authorization = `Bearer ${sessionToken}`;
      }

      // Set baseURL from environment variable
      axios.defaults.baseURL = import.meta.env.VITE_API_URL;
      axios.defaults.withCredentials = true;

      // Return the next action
      return next(action);
    };
}

const axiosAuth = createAxiosAuthMiddleware();

export default axiosAuth;
