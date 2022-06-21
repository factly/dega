import {
  SACH_FACT_CHECKS_API,
  ADD_SACH_FACT_CHECKS,
  SET_SACH_FACT_CHECKS_LOADING
} from '../constants/sachFactChecks';

import { addErrorNotification } from './notifications';
import getError from '../utils/getError';

export const getSachFactChecks = (reqBody, setTotalMatches) => {
  return (dispatch) => {
    dispatch(loadingSachFactChecks());
    fetch(`${window.REACT_APP_SACH_API_URL}${SACH_FACT_CHECKS_API}`, {
      method: 'POST',
      body: JSON.stringify(reqBody)
    })
    .then((res) => {
			if(res.status === 200){
				return res.json()
			}else {
				throw new Error(res.status)
			}
		}).
		then((res) => {
      dispatch(addFactChecks(res.results))
      setTotalMatches(res.total)
		})
		.catch((error) => {
			dispatch(addErrorNotification(getError(error)))
		})
    .finally(() => dispatch(stopLoading()))
  }
}


export const getSachFilters = (setLanguage, setPublisher, setCountries) => {
  return (dispatch) => {
    dispatch(loadingSachFactChecks());
    fetch(`${window.REACT_APP_SACH_API_URL}${SACH_FACT_CHECKS_API}/filters`)
    .then((res) => {
			if(res.status === 200){
				return res.json()
			}else {
				throw new Error(res.status)
			}
		})
    .then((res)=>{
      setCountries(res.countries)
      setLanguage(res.languages)
      setPublisher(res.publishers)
    })
    .catch((error) => {
      dispatch(addErrorNotification(getError(error)))
    })
    .finally(() => dispatch(stopLoading()))
  }
}

export const loadingSachFactChecks = () => ({
  type: SET_SACH_FACT_CHECKS_LOADING,
  payload: true
})

export const stopLoading = () => ({
  type: SET_SACH_FACT_CHECKS_LOADING,
  payload: false
})

export const addFactChecks = (data) => ({
  type: ADD_SACH_FACT_CHECKS,
  payload: data
})