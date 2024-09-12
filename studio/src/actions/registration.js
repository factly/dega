export const registerUser = async (registrationData) => {
  try {
    const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/human`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message.split('(')[0].trim();
      throw new Error(errorMessage || 'Failed to register user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const createSession = async (loginName) => {
  try {
    const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        checks: {
          user: {
            loginName,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

export const verifyPassword = async (sessionId, sessionToken, password) => {
  try {
    const response = await fetch(
      `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
        },
        body: JSON.stringify({
          sessionToken: sessionToken,
          checks: {
            password: {
              password: password,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.message.split('(')[0].trim();
      throw new Error(errorMessage || 'Failed to verify password');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
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
    throw new Error('Failed to finalize auth request');
  }

  return response.json();
};