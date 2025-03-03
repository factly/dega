import axios from "axios";
import {
  SET_PROFILE_LOADING,
  ADD_PROFILE,
  PROFILE_API,
} from "../constants/profile";
import { addErrorNotification, addSuccessNotification } from "./notifications";

// Define interfaces
interface Profile {
  [key: string]: any;
}

interface ProfileAction {
  type: string;
  payload: any;
}

export const getUserProfile = () => {
  return (dispatch: (action: any) => void, getState: () => any) => {
    dispatch(loadingProfile());
    return axios
      .get(PROFILE_API)
      .then((response) => {
        dispatch(getProfile(response.data));
        dispatch(stopProfileLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const updateProfile = (data: Partial<Profile>) => {
  return (dispatch: (action: any) => void, getState: () => any) => {
    dispatch(loadingProfile());
    return axios
      .put(PROFILE_API, data)
      .then((response) => {
        dispatch(getProfile(response.data));
        dispatch(stopProfileLoading());
        dispatch(addSuccessNotification("Profile Updated"));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const loadingProfile = (): ProfileAction => ({
  type: SET_PROFILE_LOADING,
  payload: true,
});

export const stopProfileLoading = (): ProfileAction => ({
  type: SET_PROFILE_LOADING,
  payload: false,
});

export const getProfile = (data: Profile): ProfileAction => ({
  type: ADD_PROFILE,
  payload: data,
});
