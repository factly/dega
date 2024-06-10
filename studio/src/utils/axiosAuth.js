import axios from 'axios';

function createAxiosAuthMiddleware() {
  return ({ getState }) => (next) => (action) => {
    axios.defaults.headers.common['X-Space'] = getState().spaces.selected;
    if (
      window.localStorage.getItem(
        'oidc.user:' +
          window.REACT_APP_ZITADEL_AUTHORITY +
          ':' +
          window.REACT_APP_ZITADEL_CLIENT_ID,
      )
    ) {
      const user = JSON.parse(
        window.localStorage.getItem(
          'oidc.user:' +
            window.REACT_APP_ZITADEL_AUTHORITY +
            ':' +
            window.REACT_APP_ZITADEL_CLIENT_ID,
        ),
      );
      axios.defaults.headers.common.Authorization = `Bearer ${user.access_token}`;
    }
    axios.defaults.baseURL = window.REACT_APP_API_URL;
    axios.defaults.withCredentials = true;
    return next(action);
  };
}

const axiosAuth = createAxiosAuthMiddleware();

export default axiosAuth;
