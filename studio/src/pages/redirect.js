import { useEffect, useState } from 'react';
import Loader from '../components/Loader';

const Callback = ({ authenticated, setAuth, userManager }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!authenticated) {
      userManager
        .signinRedirectCallback()
        .then((user) => {
          if (user) {
            setAuth(true);
            setUserInfo(user);
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
  }, [authenticated]);

  if (authenticated === true && userInfo) {
    window.location.href = window.localStorage.getItem('return_to') || window.PUBLIC_URL;
  }
  return <Loader />;
};

export default Callback;
