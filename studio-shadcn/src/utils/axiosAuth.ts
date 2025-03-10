import axios from "axios";
import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";

function createAxiosAuthMiddleware(): Middleware {
  return ({ getState }) =>
    (next) =>
    (action) => {
      try {
        const state = getState() as RootState;

        // Get token from localStorage
        const sessionToken = localStorage.getItem("sessionToken");

        // Get stored space ID from localStorage as fallback
        const storedSpaceId = localStorage.getItem("space");

        // Set the X-Space header
        const spaceId = state.spaces?.selected || storedSpaceId || "";
        if (spaceId) {
          axios.defaults.headers.common["X-Space"] = spaceId;
        }

        // Set auth token if available
        if (sessionToken) {
          axios.defaults.headers.common.Authorization = `Bearer ${sessionToken}`;
        } else {
          // Clear the Authorization header if no token
          delete axios.defaults.headers.common.Authorization;
        }

        // Set baseURL from environment variable
        axios.defaults.baseURL = import.meta.env.VITE_API_URL;
        axios.defaults.withCredentials = true;
      } catch (error) {
        console.error("Error in axios auth middleware:", error);
      }

      // Return the next action
      return next(action);
    };
}

const axiosAuth = createAxiosAuthMiddleware();

export default axiosAuth;
