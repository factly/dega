import { combineReducers } from 'redux';
import settings from './settings';
import spaces from './spaces';
import categories from './categories';

export default combineReducers({
  settings,
  spaces,
  categories,
});
