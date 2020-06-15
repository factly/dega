import axios from 'axios';

export default axios.create({
  baseURL: '/',
  headers: {
    common: {
      'X-User': '2',
      'X-Space': '2',
    },
  },
});
