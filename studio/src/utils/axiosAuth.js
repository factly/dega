import axios from 'axios';

function createAxiosAuthMiddleware() {
  return ({ getState }) => (next) => (action) => {
    axios.defaults.headers.common['X-Space'] = getState().spaces.selected;
    axios.defaults.baseURL = window.REACT_APP_API_URL;
    axios.defaults.withCredentials = true;
    return next(action);
  };
}

const axiosAuth = createAxiosAuthMiddleware();

export default axiosAuth;
