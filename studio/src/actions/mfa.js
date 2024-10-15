export const startTOTPRegistration = async (userId, token, data = {}) => {
  try {
    const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/totp`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to start TOTP registration');
    }
    return await response.json();
  } catch (error) {
    console.error('Error starting TOTP registration:', error);
    throw error;
  }
};

export const verifyTOTPRegistration = async (userId, token, code) => {
  try {
    const response = await fetch(
      `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/totp/verify`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to verify TOTP registration');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying TOTP registration:', error);
    throw error;
  }
};

export const checkTOTP = async (sessionId, sessionToken, code) => {
  try {
    const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        sessionToken,
        checks: {
          totp: {
            code,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to check TOTP');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking TOTP:', error);
    throw error;
  }
};
