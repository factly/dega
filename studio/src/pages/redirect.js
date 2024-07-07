import { useEffect, useState } from 'react';
import Loader from '../components/Loader';

const Callback = ({ authenticated, setAuth, userManager, handleLogout }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (authenticated === null) {
      userManager
        .signinRedirectCallback()
        .then((user) => {
          if (user) {
            setAuth(true);
            setUserInfo(user);
            setCookie(user.access_token, user.expires_at);
          } else {
            setAuth(false);
          }
        })
        .catch((error) => {
          setAuth(false);
        });
    }
    if (authenticated === true && userInfo === null) {
      userManager
        .getUser()
        .then((user) => {
          if (user) {
            setAuth(true);
            setUserInfo(user);
          } else {
            setAuth(false);
          }
        })
        .catch(() => {
          setAuth(false);
        });
    }
  }, [authenticated, userManager, setAuth]);

  const setCookie = (value, expiryTime) => {
    const date = new Date(expiryTime);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `x-user-token=${value};${expires};path=/;HttpOnly`;
  };

  if (authenticated === true && userInfo) {
    window.location.href = window.localStorage.getItem('return_to') || window.PUBLIC_URL;
  }
  return <Loader />;
};

export default Callback;
