export const login = async () => {
  return getOpenIDConfiguration().then(async (d) => {
    if (d.error) {
      console.log(d.error);
    }
    if (d.error) {
      return { error: d.error };
    }
    const config = d.data;

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem('code_verifier', codeVerifier);

    const state = generateRandomString();
    localStorage.setItem('auth_state', state);

    const authorizeURL =
      `http://localhost:7789/test/authorize?` +
      `client_id=${encodeURIComponent(window.REACT_APP_ZITADEL_CLIENT_ID)}` +
      `&response_type=code` +
      `&response_mode=query` +
      `&code_challenge_method=S256` +
      `&redirect_uri=${encodeURIComponent(window.REACT_APP_ZITADEL_REDIRECT_URI)}` +
      `&post_logout_redirect_uri=${encodeURIComponent(
        window.REACT_APP_ZITADEL_POST_LOGOUT_REDIRECT_URI,
      )}` +
      `&state=${state}` +
      `&scope=${encodeURIComponent(
        'openid profile email urn:zitadel:iam:user:metadata urn:zitadel:iam:user:resourceowner urn:zitadel:iam:org:project:id:zitadel:aud urn:zitadel:iam:org:project:' +
          window.REACT_APP_ZITADEL_PROJECT_ID +
          ':roles',
      )}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}`;

    return { authorizeURL };
  });
};




export const getToken = (code) =>
  fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/oauth/v2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: window.REACT_APP_ZITADEL_CLIENT_ID,
      redirect_uri: window.REACT_APP_ZITADEL_REDIRECT_URI,
      code_verifier: localStorage.getItem('code_verifier'),
      grant_type: 'authorization_code',
    }).toString(),
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem('sessionToken', data.access_token);
      localStorage.setItem('x-zitadel-id-token', data.id_token);
      return {};
    })
    .catch(() => {
      return {
        error: 'Error fetching token',
      };
    });

export const getUserInfo = () =>
  fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/oidc/v1/userinfo`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
    },
    credentials: 'include',
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        return Promise.reject('Unauthorized');
      }
    })
    .then((data) => {
      return { data };
    })
    .catch(() => {
      return {
        error: 'Error fetching user info',
      };
    });

const generateCodeChallenge = (codeVerifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  return crypto.subtle.digest('SHA-256', data).then((digest) => {
    const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return base64Digest;
  });
};

function generateCodeVerifier(length = 128) {
  const randomArray = new Uint8Array(length);
  window.crypto.getRandomValues(randomArray);
  return btoa(String.fromCharCode(...randomArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateRandomString(length = 128) {
  const randomArray = new Uint8Array(length);
  window.crypto.getRandomValues(randomArray);
  return btoa(String.fromCharCode(...randomArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const getOpenIDConfiguration = () =>
  fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/.well-known/openid-configuration`, {
    credentials: 'include',
  })
    .then((response) => response.json())
    .then((config) => {
      return { data: JSON.parse(JSON.stringify(config, null, 2)) };
    })
    .catch(() => {
      return {
        error: 'Error fetching OpenID configuration',
      };
    });