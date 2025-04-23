import { Dispatch, Action } from "redux";
import { SET_COLLAPSE } from "../constants/sidebar";

// Define action interface
interface SetCollapseAction extends Action {
  type: typeof SET_COLLAPSE;
  payload: boolean;
}

// Action creator
export const setCollapse = (
  collapsed: boolean
): ((dispatch: Dispatch<SetCollapseAction>) => void) => {
  return (dispatch: Dispatch<SetCollapseAction>): void => {
    dispatch({
      type: SET_COLLAPSE,
      payload: collapsed,
    });
  };
};
