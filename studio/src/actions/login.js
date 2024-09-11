export const createSession = async (email) => {
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
          loginName: email,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create session');
  }

  return response.json();
};

export const getUserDetails = async (sessionId) => {
  const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }

  return response.json();
};

export const verifyPassword = async (sessionId, sessionToken, password) => {
  const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`, {
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
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Invalid password');
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
    throw new Error('Failed to finalize auth request');
  }

  return response.json();
};