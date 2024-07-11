import { ADD_SESSION, SET_SESSIONS_LOADING } from '../constants/session';
import { getUserInfo } from '../utils/zitadel';

export const getSession = () => {
  return (dispatch) => {
    dispatch(setLoading);

    return getUserInfo().then((res) => {
      if (res.error) {
        return { success: false };
      }
      dispatch(addSession(res.data));
      dispatch(setLoading(false));

      return { success: true };
    });
  };
};

const addSession = (session) => {
  return { type: ADD_SESSION, payload: session };
};
const setLoading = (loading) => {
  return { type: SET_SESSIONS_LOADING, payload: loading };
};
