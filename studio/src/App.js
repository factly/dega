import React, { useEffect, useState } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import 'antd/dist/reset.css';

//Routes
import { extractV6RouteObject } from './config/routesConfig';
import { useDispatch, useSelector } from 'react-redux';
import { getFormats } from '../src/actions/formats';
import deepEqual from 'deep-equal';
import { createZitadelAuth } from '@zitadel/react';

function App() {
  const config = {
    authority: window.REACT_APP_ZITADEL_AUTHORITY,
    client_id: window.REACT_APP_ZITADEL_CLIENT_ID,
    redirect_uri: window.REACT_APP_ZITADEL_REDIRECT_URI,
    post_logout_redirect_uri: window.REACT_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI,
    scope: `openid profile email urn:zitadel:iam:user:metadata urn:zitadel:iam:user:resourceowner urn:zitadel:iam:org:project:id:zitadel:aud urn:zitadel:iam:org:project:${window.REACT_APP_ZITADEL_PROJECT_ID}:roles`,
    response_type: 'code',
    response_mode: 'query',
    code_challenge_method: 'S256',
  };
  const [authenticated, setAuthenticated] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(false);
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

  useEffect(() => {
    fetchFormats();
  }, [dispatch, selected, reloadFlag]);

  const zitadel = createZitadelAuth(config);

  const login = () => {
    zitadel.authorize();
  };

  const signout = () => {
    zitadel.signout();
  };

  useEffect(() => {
    zitadel.userManager.getUser().then((user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    });
  }, [zitadel]);

  useEffect(() => {
    if (
      !authenticated &&
      !window.location.href.includes('redirect') &&
      !window.localStorage.getItem(
        'oidc.user:' +
          window.REACT_APP_ZITADEL_AUTHORITY +
          ':' +
          window.REACT_APP_ZITADEL_CLIENT_ID,
      )
    ) {
      window.localStorage.setItem('return_to', window.location.href);
      login();
    }
  }, [authenticated]);

  const fetchFormats = () => {
    if (selected !== '') dispatch(getFormats({ space_id: selected }));
  };

  const router = createBrowserRouter(
    extractV6RouteObject(
      formats,
      setReloadFlag,
      reloadFlag,
      authenticated,
      setAuthenticated,
      zitadel.userManager,
      signout,
    ),
  );
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
