import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSession } from '../actions/session';
import { login } from '../utils/zitadel';
import { addErrorNotification } from '../actions/notifications';
import { useLocation } from 'react-router-dom';

const AuthWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  // List of public paths that don't require authentication
  const publicPaths = [
    '/auth/login',
    '/auth/registration',
    '/auth/login/recovery',
    '/redirect',
    '/auth/verify',
  ];

  useEffect(() => {
    checkAuthenticated();
  }, [location.pathname]);

  const isPublicPath = (path) => {
    return publicPaths.some((publicPath) => path.includes(publicPath));
  };

  const checkAuthenticated = () => {
    dispatch(getSession()).then((res) => {
      if (!res.success) {
        // If there's no token or authentication failed
        if (res.noToken || !res.success) {
          const currentURL = window.location.href;
          const searchParams = new URLSearchParams(window.location.search);
          const authRequest = searchParams.get('authRequest');

          // If current path is public and has authRequest, allow access
          if (isPublicPath(currentURL) && authRequest) {
            return;
          }

          // Store the return URL for post-login redirect
          if (!isPublicPath(location.pathname)) {
            window.localStorage.setItem('return_to', window.location.href);
          }

          // Initiate login process
          if (!isPublicPath(location.pathname)) {
            login().then((d) => {
              if (d.error) {
                dispatch(
                  addErrorNotification({
                    message: d.error,
                  }),
                );
                return;
              }
              window.location.href = d.authorizeURL;
            });
          }
        }
      }
    });
  };

  return <>{children}</>;
};

export default AuthWrapper;
