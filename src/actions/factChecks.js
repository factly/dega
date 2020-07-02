import axios from 'axios';
import {
  ADD_FACT_CHECK,
  ADD_FACT_CHECKS,
  ADD_FACT_CHECKS_REQUEST,
  SET_FACT_CHECKS_LOADING,
  RESET_FACT_CHECKS,
  FACT_CHECKS_API,
} from '../constants/factChecks';
import { addErrorNotification } from './notifications';
import { addCategories } from './categories';
import { addTags } from './tags';
import { addClaims } from './claims';
import { addMediaList } from './media';

export const getFactChecks = (query) => {
  return (dispatch) => {
    dispatch(loadingFactChecks());
    return axios
      .get(FACT_CHECKS_API, {
        params: query,
      })
      .then((response) => {
        dispatch(
          addTags(
            response.data.nodes
              .filter((factCheck) => factCheck.tags.length > 0)
              .map((factCheck) => {
                return { ...factCheck.tags };
              }),
          ),
        );
        dispatch(
          addCategories(
            response.data.nodes
              .filter((factCheck) => factCheck.categories.length > 0)
              .map((factCheck) => {
                return { ...factCheck.categories };
              }),
          ),
        );
        dispatch(
          addClaims(
            response.data.nodes
              .filter((factCheck) => factCheck.claims.length > 0)
              .map((factCheck) => {
                return { ...factCheck.claims };
              }),
          ),
        );
        dispatch(
          addMediaList(
            response.data.nodes
              .filter((factCheck) => factCheck.medium.id)
              .map((factCheck) => {
                return factCheck.medium;
              }),
          ),
        );
        dispatch(
          addFactChecksList(
            response.data.nodes.map((factCheck) => {
              return {
                ...factCheck,
                categories: factCheck.categories.map((category) => category.id),
                tags: factCheck.tags.map((tag) => tag.id),
                claims: factCheck.claims.map((claim) => claim.id),
              };
            }),
          ),
        );
        dispatch(
          addFactChecksRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopFactChecksLoading());
      })
      .catch((error) => {
        console.log(error.message);
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const getFactCheck = (id) => {
  return (dispatch) => {
    dispatch(loadingFactChecks());
    return axios
      .get(FACT_CHECKS_API + '/' + id)
      .then((response) => {
        let factCheck = response.data;

        dispatch(addTags(factCheck.tags));
        dispatch(addCategories(factCheck.categories));
        dispatch(addClaims(factCheck.claims));
        if (factCheck.medium) dispatch(addMediaList([factCheck.medium]));

        dispatch(
          getFactCheckByID({
            ...factCheck,
            categories: factCheck.categories.map((category) => category.id),
            tags: factCheck.tags.map((tag) => tag.id),
            claims: factCheck.claims.map((claim) => claim.id),
          }),
        );
        dispatch(stopFactChecksLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const addFactCheck = (data) => {
  return (dispatch) => {
    dispatch(loadingFactChecks());
    return axios
      .post(FACT_CHECKS_API, data)
      .then((response) => {
        let factCheck = response.data;
        dispatch(addTags(factCheck.tags));
        dispatch(addCategories(factCheck.categories));
        dispatch(addClaims(factCheck.claims));
        if (factCheck.medium) dispatch(addMediaList([factCheck.medium]));
        dispatch(resetFactChecks());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const updateFactCheck = (data) => {
  return (dispatch) => {
    dispatch(loadingFactChecks());
    return axios
      .put(FACT_CHECKS_API + '/' + data.id, data)
      .then((response) => {
        let factCheck = response.data;
        dispatch(addTags(factCheck.tags));
        dispatch(addCategories(factCheck.categories));
        dispatch(addClaims(factCheck.claims));
        if (factCheck.medium) dispatch(addMediaList([factCheck.medium]));
        dispatch(
          getFactCheckByID({
            ...factCheck,
            categories: factCheck.categories.map((category) => category.id),
            tags: factCheck.tags.map((tag) => tag.id),
            claims: factCheck.claims.map((claim) => claim.id),
          }),
        );
        dispatch(stopFactChecksLoading());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

export const deleteFactCheck = (id) => {
  return (dispatch) => {
    dispatch(loadingFactChecks());
    return axios
      .delete(FACT_CHECKS_API + '/' + id)
      .then(() => {
        dispatch(resetFactChecks());
      })
      .catch((error) => {
        dispatch(addErrorNotification(error.message));
      });
  };
};

const loadingFactChecks = () => ({
  type: SET_FACT_CHECKS_LOADING,
  payload: true,
});

const stopFactChecksLoading = () => ({
  type: SET_FACT_CHECKS_LOADING,
  payload: false,
});

const getFactCheckByID = (data) => ({
  type: ADD_FACT_CHECK,
  payload: data,
});

const addFactChecksList = (data) => ({
  type: ADD_FACT_CHECKS,
  payload: data,
});

const addFactChecksRequest = (data) => ({
  type: ADD_FACT_CHECKS_REQUEST,
  payload: data,
});

const resetFactChecks = () => ({
  type: RESET_FACT_CHECKS,
});
