import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSession } from '../actions/session';
import { login } from '../utils/zitadel';
import { addErrorNotification } from '../actions/notifications';
import { useLocation } from 'react-router-dom';
const AuthWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    checkAuthenticated();
  }, [location.pathname]);

  const checkAuthenticated = () => {
    dispatch(getSession()).then((res) => {
      if (!res.success) {
        if (res.noToken) {
          const currentURL = window.location.href;
          const searchParams = new URLSearchParams(window.location.search);
          const authRequest = searchParams.get('authRequest');
          if (
            (currentURL.includes('/auth/login') ||
              currentURL.includes('/auth/registration') ||
              currentURL.includes('/redirect') ||
              currentURL.includes('/auth/verify') ||
              currentURL.includes('/auth/login/recovery')) &&
            authRequest
          ) {
            return;
          }

          window.localStorage.setItem('return_to', window.location.href);
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
    });
  };

  return <>{children}</>;
};

export default AuthWrapper;
