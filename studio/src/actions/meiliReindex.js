import axios from 'axios';
import { MEILI_REINDEX_API } from '../constants/meiliReindex';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

export const reindexSpace = (id) => {
  return (dispatch) => {
    return axios
      .post(MEILI_REINDEX_API + '/space/' + id)
      .then((response) => {
        if (response.status === 200) dispatch(addSuccessNotification('Successfully Reindexed'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};
export const reindex = () => {
  return (dispatch) => {
    return axios
      .post(MEILI_REINDEX_API + '/all')
      .then((response) => {
        if (response.status === 200) dispatch(addSuccessNotification('Successfully Reindexed'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};
