//Actions
export const GET_ROLE = 'GET_ROLE';
export const UPDATE_ROLE = 'UPDATE_ROLE';
export const ADD_ROLES = 'ADD_ROLES';
export const ADD_ROLES_REQUEST = 'ADD_ROLES_REQUEST';
export const RESET_ROLES = 'RESET_ROLES';
export const SET_ROLES_LOADING = 'SET_ROLES_LOADING';

//API
export const ROLES_API = (selectedSpace) => `core/spaces/${selectedSpace}/roles`;
