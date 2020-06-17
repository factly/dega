import { combineReducers } from 'redux';
import settings from './settings';
import spaces from './spaces';
import categories from './categories';
import tags from './tags';
import formats from './formats';
import media from './media';

export default combineReducers({
  settings,
  spaces,
  categories,
  tags,
  formats,
  media,
});
