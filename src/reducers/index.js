import { combineReducers } from 'redux';
import organisationReducer from './organisation';
import settings from './settings';
import spaces from './spaces';

export default combineReducers({
  settings,
  spaces,
  organisationReducer,
});
