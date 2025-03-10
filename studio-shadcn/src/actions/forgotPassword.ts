import { ErrorResponse, PasswordResetResponse } from "./types";

export const requestPasswordReset = async (
  userId: string
): Promise<PasswordResetResponse> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_ZITADEL_AUTHORITY
    }/v2/users/${userId}/password_reset`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        sendLink: {
          notificationType: "NOTIFICATION_TYPE_Email",
          urlTemplate: `${
            import.meta.env.VITE_PUBLIC_URL
          }/auth/login/recovery?userID={{.UserID}}&code={{.Code}}&orgID={{.OrgID}}`,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse;
    throw new Error(error.message || "Failed to send reset email");
  }

  return response.json();
};

export const resetPassword = async (
  userId: string,
  newPassword: string,
  verificationCode: string
): Promise<void> => {
  if (!userId || !newPassword || !verificationCode) {
    throw new Error("Missing required parameters for password reset");
  }

  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users/${userId}/password`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        newPassword: {
          password: newPassword,
          changeRequired: false,
        },
        verificationCode: verificationCode,
      }),
    }
  );

  if (!response.ok) {
    const error = (await response.json()) as ErrorResponse;
    throw new Error(error.message || "Failed to reset password");
  }
};
