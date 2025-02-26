import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { RootState } from "./index";

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

// Define the type for dispatch function when using with thunks
export type AppThunkDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

