import { combineReducers } from 'redux';
import settings from './settings';
import spaces from './spaces';
import media from './media';

export default combineReducers({
  settings,
  spaces,
  media,
});
