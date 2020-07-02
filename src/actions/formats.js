import axios from 'axios';
import {
  ADD_FORMAT,
  ADD_FORMATS,
  ADD_FORMATS_REQUEST,
  SET_FORMATS_LOADING,
  RESET_FORMATS,
  FORMATS_API,
} from '../constants/formats';
import { addErrorNotification } from './notifications';

export const getFormats = (query) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .get(FORMATS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(addFormats(response.data.nodes));
        dispatch(
          addFormatsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopFormatsLoading());
      })
      .catch((error) => {
        console.log(error.message);
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getFormat = (id) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .get(FORMATS_API + '/' + id)
      .then((response) => {
        dispatch(getFormatByID(response.data));
        dispatch(stopFormatsLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addFormat = (data) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .post(FORMATS_API, data)
      .then(() => {
        dispatch(resetFormats());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const updateFormat = (data) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .put(FORMATS_API + '/' + data.id, data)
      .then((response) => {
        dispatch(getFormatByID(response.data));
        dispatch(stopFormatsLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteFormat = (id) => {
  return (dispatch) => {
    dispatch(loadingFormats());
    return axios
      .delete(FORMATS_API + '/' + id)
      .then(() => {
        dispatch(resetFormats());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

const loadingFormats = () => ({
  type: SET_FORMATS_LOADING,
  payload: true,
});

const stopFormatsLoading = () => ({
  type: SET_FORMATS_LOADING,
  payload: false,
});

const getFormatByID = (data) => ({
  type: ADD_FORMAT,
  payload: data,
});

export const addFormats = (data) => ({
  type: ADD_FORMATS,
  payload: data,
});

const addFormatsRequest = (data) => ({
  type: ADD_FORMATS_REQUEST,
  payload: data,
});

const resetFormats = () => ({
  type: RESET_FORMATS,
});
