import { Dispatch } from "redux";
import { SET_VISIBLE } from "./../constants/spaceSelectorPage";

// Action interface
interface SetSpaceSelectorPageAction {
  type: typeof SET_VISIBLE;
  payload: boolean;
}

// Type for all possible actions in this file
export type SpaceSelectorPageActionTypes = SetSpaceSelectorPageAction;

export const setSpaceSelectorPage = (visible: boolean) => {
  return (dispatch: Dispatch<SpaceSelectorPageActionTypes>) => {
    dispatch({
      type: SET_VISIBLE,
      payload: visible,
    });
  };
};
