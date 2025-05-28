import axios from "axios";
import {
  ADD_SEARCH_DETAIL,
  SET_SEARCH_DETAILS_LOADING,
  SEARCH_DETAILS_API,
} from "../constants/search";
import { addErrorNotification } from "./notifications";
import getError from "../utils/getError";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

// Define interfaces for our state and actions
interface RootState {
  formats: {
    details: any;
  };
}

interface SearchDetail {
  data: any;
  formats: any;
}

interface AddSearchDetailAction {
  type: typeof ADD_SEARCH_DETAIL;
  payload: SearchDetail;
}

interface SetSearchDetailsLoadingAction {
  type: typeof SET_SEARCH_DETAILS_LOADING;
  payload: boolean;
}

type SearchActionTypes = AddSearchDetailAction | SetSearchDetailsLoadingAction;

// Thunk action creator
export const getSearchDetails = (
  query: any
): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => {
  return async (
    dispatch: ThunkDispatch<RootState, unknown, AnyAction>,
    getState: () => RootState
  ): Promise<void> => {
    dispatch(loadingSearchDetails());

    try {
      const response = await axios.post(SEARCH_DETAILS_API, query);
      const state = getState();
      dispatch(
        addSearchDetails({
          data: response.data,
          formats: state.formats.details,
        })
      );
    } catch (error) {
      dispatch(addErrorNotification(getError(error)));
    } finally {
      dispatch(stopLoading());
    }
  };
};

// Action creators
export const addSearchDetails = (
  data: SearchDetail
): AddSearchDetailAction => ({
  type: ADD_SEARCH_DETAIL,
  payload: data,
});

export const loadingSearchDetails = (): SetSearchDetailsLoadingAction => ({
  type: SET_SEARCH_DETAILS_LOADING,
  payload: true,
});

export const stopLoading = (): SetSearchDetailsLoadingAction => ({
  type: SET_SEARCH_DETAILS_LOADING,
  payload: false,
});
