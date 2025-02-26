import axios from "axios";
import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";

function createAxiosAuthMiddleware(): Middleware {
  return ({ getState }) =>
    (next) =>
    (action) => {
      const state = getState() as RootState;

      // Get selected space from state, similar to the JS version
      const selectedSpace = state.spaces.selected;

      // Get token from localStorage, similar to the JS version
      const sessionToken = localStorage.getItem("sessionToken");

      // Set axios defaults with proper authorization
      if (selectedSpace) {
        axios.defaults.headers.common["X-Space"] = selectedSpace;
      }

      if (sessionToken) {
        axios.defaults.headers.common.Authorization = `Bearer ${sessionToken}`;
      }

      axios.defaults.baseURL = import.meta.env.VITE_API_URL;
      axios.defaults.withCredentials = true;

      return next(action);
    };
}

const axiosAuth = createAxiosAuthMiddleware();

export default axiosAuth;
