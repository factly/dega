import React from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider , Route } from "react-router-dom";
// import 'antd/dist/antd.css';
import 'antd/dist/reset.css';
import BasicLayout from './layouts/basic';
//Routes
import routes, { extractV6RouteObject } from './config/routesConfig';
import ProtectedRoute from './components/ProtectedRoute';
import { Result, Button } from 'antd';
import AdminRoute from './components/AdminRoute';
import { useDispatch, useSelector } from 'react-redux';
import { getFormats } from '../src/actions/formats';
import deepEqual from 'deep-equal';


function App() {
  const [reloadFlag, setReloadFlag] = React.useState(false);
  const dispatch = useDispatch();
  const selected = useSelector((state) => state.spaces.selected);

  const { formats } = useSelector((state) => {
    const node = state.formats.req.find((item) => {
      return deepEqual(item.query, { space_id: selected });
    });
    if (node) {
      const formats = node.data.map((element) => state.formats.details[element]);
      const article = formats.find((format) => format.slug === 'article');
      const factcheck = formats.find((format) => format.slug === 'fact-check');
      if (article || factcheck) {
        const format = {
          factcheck: factcheck,
          article: article,
          loading: state.formats.loading,
        };
        return { formats: format };
      }
    }
    return { formats: { loading: state.formats.loading } };
  });

  const fetchFormats = () => {
    if (selected > 0) dispatch(getFormats({ space_id: selected }));
  };

  React.useEffect(() => {
    fetchFormats();
  }, [dispatch, selected, reloadFlag]);
  const router = createBrowserRouter( extractV6RouteObject(routes , formats ,setReloadFlag ,reloadFlag) , { basename: process.env.PUBLIC_URL});  
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
