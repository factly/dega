import axios from "axios";
import {
  ADD_CLAIMANTS,
  ADD_CLAIMANTS_REQUEST,
  SET_CLAIMANTS_LOADING,
  RESET_CLAIMANTS,
  CLAIMANTS_API,
  UPDATE_CLAIMANT,
  GET_CLAIMANT,
} from "../constants/claimants";
import { addErrorNotification, addSuccessNotification } from "./notifications";
import { addMedia } from "./media";
import getError from "../utils/getError";
import { Dispatch, AnyAction } from "redux";

// Define types
interface Description {
  json: any;
  html: string;
}

interface Medium {
  id: number;
  [key: string]: any;
}

interface Claimant {
  id: number | string;
  description?: Description;
  description_html?: string;
  medium?: Medium | null;
  [key: string]: any;
}

interface ClaimantWithMediumId extends Omit<Claimant, "medium"> {
  medium?: number;
}

interface ClaimantsResponse {
  nodes: Claimant[];
  total: number;
}

interface QueryParams {
  [key: string]: any;
}

interface ClaimantsRequest {
  data: (number | string)[];
  query: QueryParams;
  total: number;
}

// action to fetch all claimants
export const getClaimants = (query: QueryParams) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(loadingClaimants());
    return axios
      .get<ClaimantsResponse>(CLAIMANTS_API, {
        params: query,
      })
      .then((response) => {
        // Add media to store if available
        if (response.data.nodes.some((claimant) => claimant.medium)) {
          dispatch(
            addMedia(
              response.data.nodes
                .filter((claimant) => claimant.medium)
                .map((claimant) => claimant.medium as Medium)
            )
          );
        }

        // Process claimants and add to store
        dispatch(
          addClaimantsList(
            response.data.nodes.map((claimant) => {
              const updatedClaimant: ClaimantWithMediumId = {
                ...claimant,
                description: {
                  json: claimant.description,
                  html: claimant.description_html,
                },
                medium: claimant.medium?.id,
              };
              return updatedClaimant;
            })
          )
        );

        // Add request data to store
        dispatch(
          addClaimantsRequest({
            data: response.data.nodes.map((item) => item.id),
            query: query,
            total: response.data.total,
          })
        );
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

// action to fetch claimant by id
export const getClaimant = (id: number | string) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(loadingClaimants());
    return axios
      .get<Claimant>(`${CLAIMANTS_API}/${id}`)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));
        const updatedClaimant: ClaimantWithMediumId = {
          ...response.data,
          description: {
            json: response.data.description,
            html: response.data.description_html,
          },
          medium: response.data.medium?.id,
        };
        dispatch(addClaimant(GET_CLAIMANT, updatedClaimant));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

// action to create claimant
export const createClaimant = (data: Omit<Claimant, "id">) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(loadingClaimants());
    return axios
      .post<Claimant>(CLAIMANTS_API, data)
      .then(() => {
        dispatch(resetClaimants());
        dispatch(addSuccessNotification("Claimant created"));
        return Promise.resolve(); // Return a promise to allow for chaining
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return Promise.reject(error); // Return rejected promise for error handling
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

// action to update claimant by id
export const updateClaimant = (data: Claimant) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(loadingClaimants());
    return axios
      .put<Claimant>(`${CLAIMANTS_API}/${data.id}`, data)
      .then((response) => {
        if (response.data.medium) dispatch(addMedia([response.data.medium]));
        const updatedClaimant: ClaimantWithMediumId = {
          ...response.data,
          description: {
            json: response.data.description,
            html: response.data.description_html,
          },
          medium: response.data.medium?.id,
        };
        dispatch(addClaimant(UPDATE_CLAIMANT, updatedClaimant));
        dispatch(addSuccessNotification("Claimant updated"));
        return Promise.resolve(); // Return a promise to allow for chaining
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return Promise.reject(error); // Return rejected promise for error handling
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

// action to delete claimant by id
export const deleteClaimant = (id: number | string) => {
  return (dispatch: Dispatch<AnyAction>) => {
    dispatch(loadingClaimants());
    return axios
      .delete(`${CLAIMANTS_API}/${id}`)
      .then(() => {
        dispatch(resetClaimants());
        dispatch(addSuccessNotification("Claimant deleted"));
        return Promise.resolve(); // Return a promise to allow for chaining
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
        return Promise.reject(error); // Return rejected promise for error handling
      })
      .finally(() => dispatch(stopClaimantsLoading()));
  };
};

export const addClaimants = (claimants: Claimant[]) => {
  return (dispatch: Dispatch<AnyAction>) => {
    // Only dispatch addMedia if there are claimants with media
    if (claimants.some((claimant) => claimant.medium)) {
      dispatch(
        addMedia(
          claimants
            .filter((claimant) => claimant.medium)
            .map((claimant) => claimant.medium as Medium)
        )
      );
    }

    dispatch(
      addClaimantsList(
        claimants.map((claimant) => {
          return {
            ...claimant,
            medium: claimant.medium?.id,
          } as ClaimantWithMediumId;
        })
      )
    );
  };
};

export const loadingClaimants = () => ({
  type: SET_CLAIMANTS_LOADING,
  payload: true,
});

export const stopClaimantsLoading = () => ({
  type: SET_CLAIMANTS_LOADING,
  payload: false,
});

export const addClaimant = (type: string, payload: ClaimantWithMediumId) => ({
  type,
  payload,
});

export const addClaimantsList = (data: ClaimantWithMediumId[]) => ({
  type: ADD_CLAIMANTS,
  payload: data,
});

export const addClaimantsRequest = (data: ClaimantsRequest) => ({
  type: ADD_CLAIMANTS_REQUEST,
  payload: data,
});

export const resetClaimants = () => ({
  type: RESET_CLAIMANTS,
});
