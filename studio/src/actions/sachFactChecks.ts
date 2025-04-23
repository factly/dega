import {
  SACH_FACT_CHECKS_API,
  ADD_SACH_FACT_CHECKS,
  SET_SACH_FACT_CHECKS_LOADING,
} from "../constants/sachFactChecks";

import { addErrorNotification } from "./notifications";
import getError from "../utils/getError";

// Define types for our data structures
interface FactCheck {
  id: string;
  [key: string]: any;
}

interface ResultStats {
  [key: string]: any;
}

interface SachResponseData {
  results: FactCheck[];
  total: number;
  resultStats: ResultStats;
}

interface FiltersResponseData {
  countries: string[];
  languages: string[];
  publishers: string[];
}

interface RequestBody {
  [key: string]: any;
}

// Action types
interface LoadingSachFactChecksAction {
  type: typeof SET_SACH_FACT_CHECKS_LOADING;
  payload: boolean;
}

interface AddFactChecksAction {
  type: typeof ADD_SACH_FACT_CHECKS;
  payload: FactCheck[];
}

export type SachFactChecksActionTypes =
  | LoadingSachFactChecksAction
  | AddFactChecksAction;

export const getSachFactChecks = (
  reqBody: RequestBody,
  setTotalMatches: (total: number) => void,
  setResultStats: (stats: ResultStats) => void
) => {
  return (dispatch: (action: SachFactChecksActionTypes | any) => void) => {
    dispatch(loadingSachFactChecks());
    fetch(`${import.meta.env.VITE_SACH_API_URL}${SACH_FACT_CHECKS_API}`, {
      method: "POST",
      body: JSON.stringify(reqBody),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json() as Promise<SachResponseData>;
        } else {
          throw new Error(res.status.toString());
        }
      })
      .then((res) => {
        dispatch(addFactChecks(res.results));
        setTotalMatches(res.total);
        setResultStats(res.resultStats);
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const getSachFilters = (
  setLanguage: (languages: string[]) => void,
  setPublisher: (publishers: string[]) => void,
  setCountries: (countries: string[]) => void
) => {
  return (dispatch: (action: SachFactChecksActionTypes | any) => void) => {
    dispatch(loadingSachFactChecks());
    fetch(`${import.meta.env.VITE_SACH_API_URL}${SACH_FACT_CHECKS_API}/filters`)
      .then((res) => {
        if (res.status === 200) {
          return res.json() as Promise<FiltersResponseData>;
        } else {
          throw new Error(res.status.toString());
        }
      })
      .then((res) => {
        setCountries(res.countries);
        setLanguage(res.languages);
        setPublisher(res.publishers);
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      })
      .finally(() => dispatch(stopLoading()));
  };
};

export const loadingSachFactChecks = (): LoadingSachFactChecksAction => ({
  type: SET_SACH_FACT_CHECKS_LOADING,
  payload: true,
});

export const stopLoading = (): LoadingSachFactChecksAction => ({
  type: SET_SACH_FACT_CHECKS_LOADING,
  payload: false,
});

export const addFactChecks = (data: FactCheck[]): AddFactChecksAction => ({
  type: ADD_SACH_FACT_CHECKS,
  payload: data,
});
