const publicUrl = `${window.PUBLIC_URL}`

export const getProviderInformation = async (intentId, token) => {
  const response = await fetch(
    `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/idp_intents/${intentId}`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        idpIntentToken: token,
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to get provider information');
  }

  return response.json();
};

export const checkUserExists = async (email) => {
  const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
    },
    body: JSON.stringify({
      query: {
        offset: '0',
        limit: 1,
        asc: true,
      },
      queries: [
        {
          emailQuery: {
            emailAddress: email,
            method: 'TEXT_QUERY_METHOD_EQUALS',
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to check user existence');
  }

  const data = await response.json();
  return data.result && data.result.length > 0 ? data.result[0] : null;
};

export const linkExistingUser = async (userId, providerData) => {
  const response = await fetch(
    `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/links`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        idpLink: {
          idpId: window.REACT_APP_ZITADEL_IDP_ID,
          userId: providerData.idpInformation?.rawInformation?.User?.sub,
          userName: providerData.idpInformation?.rawInformation?.User?.name,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to link user to IDP');
  }

  return response.json();
};

export const createSession = async (userId, intentId = null, token = null) => {
  const body = {
    checks: {
      user: {
        userId: userId,
      },
    },
  };

  if (intentId && token) {
    body.checks.idpIntent = {
      idpIntentId: intentId,
      idpIntentToken: token,
    };
  }

  const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to create session');
  }

  return response.json();
};

export const registerUser = async (userData, intentId, token) => {
  const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/human`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
    },
    body: JSON.stringify({
      username: userData.email,
      profile: {
        givenName: userData.given_name,
        familyName: userData.family_name,
        displayName: userData.name,
      },
      email: {
        email: userData.email,
        isVerified: userData.email_verified,
      },
      idpLinks: [
        {
          idpId: window.REACT_APP_ZITADEL_IDP_ID,
          idpExternalId: userData.sub,
          userId: userData.sub,
          userName: userData.email,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to register user');
  }

  return response.json();
};

export const initiateGoogleSignIn = async (publicUrl) => {
  const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/idp_intents`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
    },
    body: JSON.stringify({
      idpId: window.REACT_APP_ZITADEL_IDP_ID,
      urls: {
        successUrl: `${publicUrl}/auth/login`,
        failureUrl: `${publicUrl}`,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to initiate Google Sign-In');
  }

  return response.json();
};

export const getAuthRequestDetails = async (authRequestId) => {
  const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/oidc/auth_requests/${authRequestId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get auth request details');
  }

  return response.json();
};

export const finalizeAuthRequest = async (authRequestId, sessionId, sessionToken) => {
  const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/oidc/auth_requests/${authRequestId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session: {
        sessionId: sessionId,
        sessionToken: sessionToken,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Error finalizing auth request:', errorData);
    throw new Error('Failed to finalize auth request: ' + (errorData.message || response.statusText));
  }
  
  return response.json();
};

