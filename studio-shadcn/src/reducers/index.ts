import { combineReducers } from 'redux';
import { RootState } from '../types/index';
import posts from '../reducers/postReducer';
import ratings from './ratingsReducer';


const appReducer = combineReducers({
    posts,
    ratings,
  });
  
  const rootReducer = (state: RootState | undefined, action: AnyAction) => {
    return appReducer(state, action);
  };
  
  export default rootReducer;