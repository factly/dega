import axios from 'axios';
import { MEILI_REINDEX_API } from '../constants/meiliReindex';
import { addErrorNotification, addSuccessNotification } from './notifications';
import getError from '../utils/getError';

export const reindex = (id) => {
  return (dispatch) => {
    return axios
      .get(MEILI_REINDEX_API + '/' + id)
      .then((response) => {
        dispatch(addSuccessNotification('Successfully Reindexed'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};
export const reindexOrg = (orgId) => {
  return (dispatch) => {
    return axios
      .get(MEILI_REINDEX_API + '/' + orgId)
      .then((response) => {
        dispatch(addSuccessNotification('Successfully Reindexed'));
      })
      .catch((error) => {
        dispatch(addErrorNotification(getError(error)));
      });
  };
};
