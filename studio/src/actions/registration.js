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
      throw new Error(errorData.message || 'Failed to register user');
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
      throw new Error(errorData.message || 'Failed to verify password');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying password:', error);
    throw error;
  }
};