const userId = localStorage.getItem('userId');
export const requestPasswordReset = async (userId) => {
  const response = await fetch(
    `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/password_reset`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        sendLink: {
          notificationType: 'NOTIFICATION_TYPE_Email',
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to send reset email');
  }

  return response.json();
};

export const resetPassword = async (userId, newPassword, verificationCode) => {
  const response = await fetch(
    `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/password`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        newPassword: {
          password: newPassword,
          changeRequired: false,
        },
        verificationCode: verificationCode,
      }),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to reset password');
  }

  return response.json();
};
