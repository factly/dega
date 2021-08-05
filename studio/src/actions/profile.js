import axios from 'axios';
import { SET_PROFILE_LOADING, ADD_PROFILE, PROFILE_API } from '../constants/profile';
import { addErrorNotification, addSuccessNotification } from './notifications';

export const getUserProfile = () => {
  return (dispatch, getState) => {
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
export const updateProfile = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingProfile());
    return axios
      .put(PROFILE_API, data)
      .then((response) => {
        dispatch(getProfile(response.data));
        dispatch(stopProfileLoading());
        dispatch(addSuccessNotification('Profile Updated'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const loadingProfile = () => ({
  type: SET_PROFILE_LOADING,
  payload: true,
});

export const stopProfileLoading = () => ({
  type: SET_PROFILE_LOADING,
  payload: false,
});

export const getProfile = (data) => ({
  type: ADD_PROFILE,
  payload: data,
});
