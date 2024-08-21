import { ADD_SESSION, SET_SESSIONS_LOADING } from '../constants/session';
import { getUserInfo } from '../utils/zitadel';

export const getSession = () => {
  return (dispatch) => {
    dispatch(setLoading(true));

    return getUserInfo()
      .then((res) => {
        if (res.error) {
          return { success: false };
        }
        dispatch(addSession(res.data));
        return { success: true };
      })
      .catch((error) => {
        console.error('Error in getSession:', error);
        return { success: false };
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
};

const addSession = (session) => {
  return { type: ADD_SESSION, payload: session };
};

const setLoading = (loading) => {
  return { type: SET_SESSIONS_LOADING, payload: loading };
};