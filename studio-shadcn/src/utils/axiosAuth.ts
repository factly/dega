import axios from "axios";
import { Middleware } from "@reduxjs/toolkit";

function createAxiosAuthMiddleware(): Middleware {
  return () => (next) => (action) => {
    // Set axios defaults
    axios.defaults.headers.common['X-Space'] = 'd6019934-d312-4ef9-a420-a14f0aad9c33';
    axios.defaults.headers.common.Authorization = 'Bearer fESNnUI5xTNBPSlH8ZqpGHqxVqHYpfo1TUi-nu2JkTvaKkob3FjIjqydNdqye4bpZVOliv0jtDkzsStYWi9EzhMQdcQyWsg-d9f5pfAU';
    axios.defaults.baseURL = import.meta.env.VITE_API_URL;
    axios.defaults.withCredentials = true;

    return next(action);
  };
}

const axiosAuth = createAxiosAuthMiddleware();

export default axiosAuth;
