import {
  ADD_SACH_FACT_CHECKS,
  SET_SACH_FACT_CHECKS_LOADING
} from '../constants/sachFactChecks';

const initialState = {
  details: [],
  loading :true
}

export default function sachFactCheckReducer(state = initialState, action={}){
  switch(action.type) {
    case ADD_SACH_FACT_CHECKS:
      return {
        ...state,
        details: [
          ...action.payload
        ]
      };
    case SET_SACH_FACT_CHECKS_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
    
  }
}