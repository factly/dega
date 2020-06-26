import axios from 'axios';
import {
  GET_FACT_CHECKS_SUCCESS,
  GET_FACT_CHECKS_FAILURE,
  GET_FACT_CHECK_SUCCESS,
  GET_FACT_CHECK_FAILURE,
  ADD_FACT_CHECK_FAILURE,
  ADD_FACT_CHECK_SUCCESS,
  API_ADD_FACT_CHECK,
  API_GET_FACT_CHECKS,
  UPDATE_FACT_CHECK_FAILURE,
  UPDATE_FACT_CHECK_SUCCESS,
  DELETE_FACT_CHECK_SUCCESS,
  DELETE_FACT_CHECK_FAILURE,
} from '../constants/factChecks';
import { LOADING_SPACES } from '../constants/spaces';
import { ADD_TAGS } from '../constants/tags';
import { ADD_CATEGORIES } from '../constants/categories';
import { ADD_CLAIMS } from '../constants/claims';

export const getFactChecks = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingFactChecks());
    return axios
      .get(API_GET_FACT_CHECKS, {
        params: query,
      })
      .then((response) => {
        let factChecks = response.data.nodes
          ? response.data.nodes.map((factCheck) => {
              if (factCheck.tags) dispatch(addTags(factCheck.tags));
              if (factCheck.categories) dispatch(addCategories(factCheck.categories));
              if (factCheck.claims) dispatch(addClaims(factCheck.claims));

              return {
                ...factCheck,
                categories: factCheck.categories.map((category) => category.id),
                tags: factCheck.tags.map((tag) => tag.id),
                claims: factCheck.claims.map((claim) => claim.id),
              };
            })
          : [];

        dispatch(getFactChecksSuccess({ ...response.data, nodes: factChecks }, query));
      })
      .catch((error) => {
        dispatch(getFactChecksFailure(error.message));
      });
  };
};
export const getFactCheck = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingFactChecks());
    return axios
      .get(API_GET_FACT_CHECKS + '/' + id)
      .then((response) => {
        let factCheck = response.data;
        if (factCheck.tags) dispatch(addTags(factCheck.tags));
        if (factCheck.categories) dispatch(addCategories(factCheck.categories));
        if (factCheck.format) dispatch(addClaims(factCheck.format));

        factCheck.categories = factCheck.categories.map((category) => category.id);
        factCheck.tags = factCheck.tags.map((tag) => tag.id);
        factCheck.claims = factCheck.claims.map((claim) => claim.id);
        dispatch(getFactCheckSuccess(factCheck));
      })
      .catch((error) => {
        dispatch(getFactCheckFailure(error.message));
      });
  };
};

export const addFactCheck = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingFactChecks());
    return axios
      .post(API_ADD_FACT_CHECK, data)
      .then((response) => {
        let factCheck = response.data;
        if (factCheck.tags) dispatch(addTags(factCheck.tags));
        if (factCheck.categories) dispatch(addCategories(factCheck.categories));
        if (factCheck.claims) dispatch(addClaims(factCheck.claims));

        factCheck.categories = factCheck.categories.map((category) => category.id);
        factCheck.tags = factCheck.tags.map((tag) => tag.id);
        factCheck.claims = factCheck.claims.map((claim) => claim.id);
        dispatch(addFactCheckSuccess(factCheck));
      })
      .catch((error) => {
        dispatch(addFactCheckFailure(error.message));
      });
  };
};

export const updateFactCheck = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingFactChecks());
    return axios
      .put(API_ADD_FACT_CHECK + '/' + data.id, data)
      .then((response) => {
        let factCheck = response.data;
        if (factCheck.tags) dispatch(addTags(factCheck.tags));
        if (factCheck.categories) dispatch(addCategories(factCheck.categories));
        if (factCheck.claims) dispatch(addClaims(factCheck.claims));

        factCheck.categories = factCheck.categories.map((category) => category.id);
        factCheck.tags = factCheck.tags.map((tag) => tag.id);
        factCheck.claims = factCheck.claims.map((claim) => claim.id);
        dispatch(updateFactCheckSuccess(factCheck));
      })
      .catch((error) => {
        dispatch(updateFactCheckFailure(error.message));
      });
  };
};

export const deleteFactCheck = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingFactChecks());
    return axios
      .delete(API_ADD_FACT_CHECK + '/' + id)
      .then(() => {
        dispatch(deleteFactCheckSuccess(id));
      })
      .catch((error) => {
        dispatch(deleteFactCheckFailure(error.message));
      });
  };
};

const loadingFactChecks = () => ({
  type: LOADING_SPACES,
});

const getFactChecksSuccess = (data, query) => ({
  type: GET_FACT_CHECKS_SUCCESS,
  payload: { data, query },
});

const getFactChecksFailure = (error) => ({
  type: GET_FACT_CHECKS_FAILURE,
  payload: {
    error,
  },
});

const getFactCheckSuccess = (data) => ({
  type: GET_FACT_CHECK_SUCCESS,
  payload: { ...data },
});

const getFactCheckFailure = (error) => ({
  type: GET_FACT_CHECK_FAILURE,
  payload: {
    error,
  },
});

const addFactCheckSuccess = (data) => ({
  type: ADD_FACT_CHECK_SUCCESS,
  payload: {
    ...data,
  },
});

const addFactCheckFailure = (error) => ({
  type: ADD_FACT_CHECK_FAILURE,
  payload: {
    error,
  },
});

const updateFactCheckSuccess = (data) => ({
  type: UPDATE_FACT_CHECK_SUCCESS,
  payload: {
    ...data,
  },
});

const updateFactCheckFailure = (error) => ({
  type: UPDATE_FACT_CHECK_FAILURE,
  payload: {
    error,
  },
});

const deleteFactCheckSuccess = (id) => ({
  type: DELETE_FACT_CHECK_SUCCESS,
  payload: id,
});

const deleteFactCheckFailure = (error) => ({
  type: DELETE_FACT_CHECK_FAILURE,
  payload: {
    error,
  },
});

const addTags = (data) => ({
  type: ADD_TAGS,
  payload: { data },
});

const addCategories = (data) => ({
  type: ADD_CATEGORIES,
  payload: { data },
});

const addClaims = (data) => ({
  type: ADD_CLAIMS,
  payload: { data },
});
