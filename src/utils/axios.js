import axios from 'axios';

export default axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    common: {
      'X-User': '1',
      'X-Space': '1',
    },
  },
});
