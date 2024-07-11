import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { getToken, getUserInfo } from '../utils/zitadel';
import { useLocation } from 'react-router-dom';

const Callback = () => {
  const [userInfo, setUserInfo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    getToken(code, state).then((d) => {
      if (!d.error) {
        getUserInfo().then((res) => {
          if (res.data) {
            setUserInfo(res.data);
          }
        });
      }
    });
  }, []);

  if (userInfo) {
    window.location.href = window.localStorage.getItem('return_to') || window.PUBLIC_URL;
  }
  return <Loader />;
};

export default Callback;
