import axios, { AxiosResponse } from "axios";
import { MEILI_REINDEX_API } from "../constants/meiliReindex";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import getError from "../utils/getError";
import { Dispatch, AnyAction } from "redux";

export const reindexSpace = (
  id: string
): ((dispatch: Dispatch<AnyAction>) => Promise<void>) => {
  return (dispatch: Dispatch<AnyAction>): Promise<void> => {
    return axios
      .post(`${MEILI_REINDEX_API}/space/${id}`)
      .then((response: AxiosResponse): void => {
        if (response.status === 200)
          dispatch(addSuccessNotification("Successfully Reindexed"));
      })
      .catch((error: unknown): void => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};

export const reindex = (): ((
  dispatch: Dispatch<AnyAction>
) => Promise<void>) => {
  return (dispatch: Dispatch<AnyAction>): Promise<void> => {
    return axios
      .post(`${MEILI_REINDEX_API}/all`)
      .then((response: AxiosResponse): void => {
        if (response.status === 200)
          dispatch(addSuccessNotification("Successfully Reindexed"));
      })
      .catch((error: unknown): void => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};
