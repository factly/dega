import { combineReducers } from 'redux';
import organisationReducer from './organisation';
import settings from './settings';

export default combineReducers({
  settings,
  organisationReducer,
});
