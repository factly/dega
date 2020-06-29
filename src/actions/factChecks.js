import axios from 'axios';
import {
  ADD_FACT_CHECK,
  ADD_FACT_CHECKS,
  ADD_FACT_CHECKS_REQUEST,
  SET_FACT_CHECKS_LOADING,
  RESET_FACT_CHECKS,
  FACT_CHECKS_API,
} from '../constants/factChecks';
import { addErrors } from './notifications';
import { addCategories } from './categories';
import { addTags } from './tags';
import { addClaims } from './claims';
import { addMediaList } from './media';

export const getFactChecks = (query) => {
  return (dispatch, getState) => {
    dispatch(loadingFactChecks());
    return axios
      .get(FACT_CHECKS_API, {
        params: query,
      })
      .then((response) => {
        let tags = [];
        let categories = [];
        let claims = [];
        let media = [];

        let factChecks = response.data.nodes.map((factCheck) => {
          if (factCheck.tags) tags.push(...factCheck.tags);
          if (factCheck.categories) categories.push(...factCheck.categories);
          if (factCheck.claims) claims.push(...factCheck.claims);
          if (factCheck.medium) media.push(factCheck.medium);
          return {
            ...factCheck,
            categories: factCheck.categories.map((category) => category.id),
            tags: factCheck.tags.map((tag) => tag.id),
            claims: factCheck.claims.map((claim) => claim.id),
          };
        });

        dispatch(addTags(tags));
        dispatch(addCategories(categories));
        dispatch(addClaims(claims));
        dispatch(addMediaList(media));
        dispatch(addFactChecksList(factChecks));
        dispatch(
          addFactChecksRequest({
            data: factChecks.map((item) => item.id),
            query: query,
            total: response.data.total,
          }),
        );
        dispatch(stopFactChecksLoading());
      })
      .catch((error) => {
        console.log(error.message);
        dispatch(addErrors(error.message));
      });
  };
};

export const getFactCheck = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingFactChecks());
    return axios
      .get(FACT_CHECKS_API + '/' + id)
      .then((response) => {
        let factCheck = response.data;

        dispatch(addTags(factCheck.tags));
        dispatch(addCategories(factCheck.categories));
        dispatch(addClaims(factCheck.claims));
        if (factCheck.medium) dispatch(addMediaList([factCheck.medium]));

        factCheck.categories = factCheck.categories.map((category) => category.id);
        factCheck.tags = factCheck.tags.map((tag) => tag.id);
        factCheck.claims = factCheck.claims.map((claim) => claim.id);

        dispatch(getFactCheckByID(factCheck));
        dispatch(stopFactChecksLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const addFactCheck = (data) => {
  return (dispatch, getState) => {
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
        dispatch(addErrors(error.message));
      });
  };
};

export const updateFactCheck = (data) => {
  return (dispatch, getState) => {
    dispatch(loadingFactChecks());
    return axios
      .put(FACT_CHECKS_API + '/' + data.id, data)
      .then((response) => {
        let factCheck = response.data;
        dispatch(addTags(factCheck.tags));
        dispatch(addCategories(factCheck.categories));
        dispatch(addClaims(factCheck.claims));
        factCheck.categories = factCheck.categories.map((category) => category.id);
        factCheck.tags = factCheck.tags.map((tag) => tag.id);
        factCheck.claims = factCheck.claims.map((claim) => claim.id);
        if (factCheck.medium) dispatch(addMediaList([factCheck.medium]));
        dispatch(getFactCheckByID(factCheck));
        dispatch(stopFactChecksLoading());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
      });
  };
};

export const deleteFactCheck = (id) => {
  return (dispatch, getState) => {
    dispatch(loadingFactChecks());
    return axios
      .delete(FACT_CHECKS_API + '/' + id)
      .then(() => {
        dispatch(resetFactChecks());
      })
      .catch((error) => {
        dispatch(addErrors(error.message));
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
  payload: {
    ...data,
  },
});

const addFactChecksList = (data) => ({
  type: ADD_FACT_CHECKS,
  payload: { data },
});

const addFactChecksRequest = (data) => ({
  type: ADD_FACT_CHECKS_REQUEST,
  payload: {
    ...data,
  },
});

const resetFactChecks = () => ({
  type: RESET_FACT_CHECKS,
});
