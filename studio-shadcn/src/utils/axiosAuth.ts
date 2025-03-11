import axios from "axios";
import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Track the last space ID to avoid unnecessary updates
let lastSpaceId: string | null = null;
let lastToken: string | null = null;

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

        // Get current space ID
        const currentSpaceId = state.spaces?.selected || storedSpaceId || "";

        // Only update headers if values have changed
        if (currentSpaceId !== lastSpaceId) {
          if (currentSpaceId) {
            axios.defaults.headers.common["X-Space"] = currentSpaceId;
          } else {
            delete axios.defaults.headers.common["X-Space"];
          }
          lastSpaceId = currentSpaceId;
        }

        // Only update auth token if it has changed
        if (sessionToken !== lastToken) {
          if (sessionToken) {
            axios.defaults.headers.common.Authorization = `Bearer ${sessionToken}`;
          } else {
            delete axios.defaults.headers.common.Authorization;
          }
          lastToken = sessionToken;
        }

        // Set baseURL once (no need to do this on every action)
        if (!axios.defaults.baseURL) {
          axios.defaults.baseURL = import.meta.env.VITE_API_URL;
          axios.defaults.withCredentials = true;
        }
      } catch (error) {
        console.error("Error in axios auth middleware:", error);
      }

      // Return the next action
      return next(action);
    };
}

const axiosAuth = createAxiosAuthMiddleware();

export default axiosAuth;
