import { useEffect, useState } from 'react';

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
            console.log('user', user);
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
        .catch((error) => {
          setAuth(false);
        });
    }
  }, [authenticated, userManager, setAuth]);

  const setCookie = (value, expiryTime) => {
    const date = new Date(expiryTime);
    const expires = `expires=${date.toUTCString()}`;

    console.log('cookie', value, date, expires);
    document.cookie = `x-user-token=${value};${expires};path=/;HttpOnly`;

    console.log('cookie', document.cookie);
  };

  if (authenticated === true && userInfo) {
    return (
      <div className="user">
        <h2>Welcome, {userInfo.profile.name}!</h2>
        <p className="description">Your ZITADEL Profile Information</p>
        <p>Name: {userInfo.profile.name}</p>
        <p>Email: {userInfo.profile.email}</p>
        <p>Email Verified: {userInfo.profile.email_verified ? 'Yes' : 'No'}</p>
        <p>Roles: {JSON.stringify(userInfo.profile['urn:zitadel:iam:org:project:roles'])}</p>

        <button onClick={handleLogout}>Log out</button>
      </div>
    );
  } else {
    return <div>Loading...</div>;
  }
};

export default Callback;
