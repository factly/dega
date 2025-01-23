/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'antd/dist/reset.css';
import { extractV6RouteObject } from './config/routesConfig';
import { useDispatch, useSelector } from 'react-redux';
import { getFormats } from '../src/actions/formats';
import deepEqual from 'deep-equal';

function App() {
  const [reloadFlag, setReloadFlag] = useState(false);
  const dispatch = useDispatch();

  const { formats, selected, session } = useSelector(({ formats, spaces, session }) => {
    const node = formats.req.find((item) => {
      return deepEqual(item.query, { space_id: spaces.selected });
    });
    if (node) {
      const formatDetails = node.data.map((element) => formats.details[element]);
      const article = formatDetails.find((format) => format.slug === 'article');
      const factcheck = formatDetails.find((format) => format.slug === 'fact-check');
      if (article || factcheck) {
        const format = {
          factcheck: factcheck,
          article: article,
          loading: formats.loading,
        };
        return { formats: format, selected: spaces.selected, session };
      }
    }
    return { formats: { loading: formats.loading }, selected: spaces.selected, session };
  });

  useEffect(() => {
    fetchFormats();
  }, [dispatch, selected, reloadFlag]);

  const fetchFormats = () => {
    if (selected !== '') dispatch(getFormats({ space_id: selected }));
  };

  const router = createBrowserRouter(
    extractV6RouteObject(formats, setReloadFlag, reloadFlag, session),
  );
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
