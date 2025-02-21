import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "../reducers/index";
import axiosAuth from "../utils/axiosAuth";

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(axiosAuth),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

export default store;
