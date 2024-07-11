import { useEffect } from 'react';
import Loader from '../components/Loader';
import { getToken, getUserInfo } from '../utils/zitadel';
import { useLocation } from 'react-router-dom';

const Callback = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');

    getToken(code, state).then((d) => {
      if (!d.error) {
        getUserInfo().then(() => {
          window.location.href = '/';
        });
      }
    });
  }, []);

  return <Loader />;
};

export default Callback;
