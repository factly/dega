import { combineReducers } from "redux";
import { RootState } from "../types/index";
import posts from "../reducers/postReducer";
import ratings from "./ratingsReducer";
import spaceSelectorPage from "./spaceSelectorPage";
import spaceUsers from "./spaceUsersReducer";
import spaces from "./spacesReducer";

const appReducer = combineReducers({
  posts,
  ratings,
  spaces,
  spaceSelectorPage,
  spaceUsers,
});

const rootReducer = (state: RootState | undefined, action: AnyAction) => {
  return appReducer(state, action);
};
export default rootReducer;
