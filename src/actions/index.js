import { GET_ORGANISATIONS, GET_ORGANISATIONS_SUCCESS } from './types';
import axios from 'axios';

export const getOrganisations = () => {
  return (dispatch, getState) => {};
};

const getOrganisationsSuccess = (todo) => ({
  type: GET_ORGANISATIONS_SUCCESS,
  payload: {},
});
