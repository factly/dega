import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../reducers/index";
import axiosAuth from "../utils/axiosAuth";
import { getSpaces } from "../actions/spaces";

// Create the Redux store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(axiosAuth),
  preloadedState: {
    // Initialize spaces state with the stored space ID
    spaces: {
      orgs: [],
      details: {},
      loading: true,
      selected: localStorage.getItem("space") || "",
      org_role: "",
    },
  },
});

// Initialize the app by loading spaces
// This ensures spaces are loaded as early as possible
store.dispatch(getSpaces());

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
