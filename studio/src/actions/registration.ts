import {
  RegistrationData,
  SessionResponse,
  AuthRequestResponse,
  ErrorResponse,
} from "./types";

export const registerUser = async (
  registrationData: RegistrationData
): Promise<{ userId: string }> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users/human`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
        },
        body: JSON.stringify({
          ...registrationData,
          email: {
            ...registrationData.email,
            sendCode: {
              urlTemplate: `${
                import.meta.env.VITE_PUBLIC_URL
              }/auth/verify?userID={{.UserID}}&code={{.Code}}&orgID={{.OrgID}}`,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      const errorMessage = errorData.message.split("(")[0].trim();
      throw new Error(errorMessage || "Failed to register user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const createSession = async (
  loginName: string
): Promise<SessionResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/sessions`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
        },
        body: JSON.stringify({
          checks: {
            user: {
              loginName,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
};

export const verifyPassword = async (
  sessionId: string,
  sessionToken: string,
  password: string
): Promise<SessionResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
        },
        body: JSON.stringify({
          sessionToken,
          checks: {
            password: {
              password,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse;
      const errorMessage = errorData.message.split("(")[0].trim();
      throw new Error(errorMessage || "Failed to verify password");
    }

    return await response.json();
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
};

export const getAuthRequestDetails = async (
  authRequestId: string
): Promise<AuthRequestResponse> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_ZITADEL_AUTHORITY
    }/v2/oidc/auth_requests/${authRequestId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get auth request details");
  }

  return response.json();
};

export const finalizeAuthRequest = async (
  authRequestId: string,
  sessionId: string,
  sessionToken: string
): Promise<AuthRequestResponse> => {
  const response = await fetch(
    `${
      import.meta.env.VITE_ZITADEL_AUTHORITY
    }/v2/oidc/auth_requests/${authRequestId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          sessionId,
          sessionToken,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to finalize auth request");
  }

  return response.json();
};
