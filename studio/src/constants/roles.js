//Actions
export const GET_ROLE = 'GET_ROLE';
export const UPDATE_ROLE = 'UPDATE_ROLE';
export const ADD_ROLES = 'ADD_ROLES';
export const ADD_ROLES_REQUEST = 'ADD_ROLES_REQUEST';
export const RESET_ROLES = 'RESET_ROLES';
export const SET_ROLES_LOADING = 'SET_ROLES_LOADING';
export const SET_SPACES_LOADING = 'SET_SPACES_LOADING';
export const ADD_SELECTED_ROLE_USERS = 'ADD_SELECTED_ROLE_USERS';
export const ADD_SPACE_USERS = 'ADD_SPACE_USERS';

//API
export const ROLES_API = (selectedSpace) => `core/spaces/${selectedSpace}/roles`;
export const SPACE_USERS_API = (selectedSpace) => `core/spaces/${selectedSpace}/users`;
