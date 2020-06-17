import axios from '../utils/axios';
import {
  GET_FORMATS_SUCCESS,
  GET_FORMATS_FAILURE,
  ADD_FORMAT_FAILURE,
  ADD_FORMAT_SUCCESS,
  API_ADD_FORMAT,
  API_GET_FORMATS,
  UPDATE_FORMAT_FAILURE,
  UPDATE_FORMAT_SUCCESS,
  DELETE_FORMAT_SUCCESS,
  DELETE_FORMAT_FAILURE,
  LOADING_FORMATS,
} from '../constants/formats';

export const getFormats = (query) => {
  return async (dispatch, getState) => {
    let found = false;
    const {
      formats: { req },
    } = getState();

    // map data based on query
    req.forEach((each) => {
      const { limit, page } = each.query;
      if (page === query.page && limit === query.limit) {
        found = true;
        return;
      }
    });

    if (!found) {
      dispatch(loadingSpaces());
      const response = await axios({
        url: API_GET_FORMATS,
        method: 'get',
        params: query,
      }).catch((error) => {
        dispatch(getFormatsFailure(error.message));
      });
      if (response) {
        dispatch(getFormatsSuccess(response.data, query));
      }
    }
  };
};

export const addFormat = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());
    const response = await axios({
      url: API_ADD_FORMAT,
      method: 'post',
      data: data,
    }).catch((error) => {
      dispatch(addFormatFailure(error.message));
    });
    if (response) {
      dispatch(addFormatSuccess(data));
    }
  };
};

export const updateFormat = (data) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());

    const response = await axios({
      url: API_ADD_FORMAT + `/${data.id}`,
      method: 'put',
      data: { ...data },
    }).catch((error) => {
      dispatch(updateFormatFailure(error.message));
    });
    if (response) {
      dispatch(updateFormatSuccess(data));
    }
  };
};

export const deleteFormat = (id) => {
  return async (dispatch, getState) => {
    dispatch(loadingSpaces());

    const response = await axios({
      url: API_ADD_FORMAT + `/${id}`,
      method: 'delete',
    }).catch((error) => {
      dispatch(deleteFormatFailure(error.message));
    });
    if (response) {
      dispatch(deleteFormatSuccess(id));
    }
  };
};

const loadingSpaces = () => ({
  type: LOADING_FORMATS,
});

const getFormatsSuccess = (data, query) => ({
  type: GET_FORMATS_SUCCESS,
  payload: { data, query },
});

const getFormatsFailure = (error) => ({
  type: GET_FORMATS_FAILURE,
  payload: {
    error,
  },
});

const addFormatSuccess = (data) => ({
  type: ADD_FORMAT_SUCCESS,
  payload: {
    ...data,
  },
});

const addFormatFailure = (error) => ({
  type: ADD_FORMAT_FAILURE,
  payload: {
    error,
  },
});

const updateFormatSuccess = (data) => ({
  type: UPDATE_FORMAT_SUCCESS,
  payload: {
    ...data,
  },
});

const updateFormatFailure = (error) => ({
  type: UPDATE_FORMAT_FAILURE,
  payload: {
    error,
  },
});

const deleteFormatSuccess = (id) => ({
  type: DELETE_FORMAT_SUCCESS,
  payload: id,
});

const deleteFormatFailure = (error) => ({
  type: DELETE_FORMAT_FAILURE,
  payload: {
    error,
  },
});
