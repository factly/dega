import type {
  UserResponse,
  SessionResponse,
  ErrorResponse,
  UserDetails,
  AuthRequestResponse,
} from "./types";

export const checkUser = async (
  emailAddress: string
): Promise<UserResponse> => {
  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        query: {
          limit: 1,
        },
        queries: [
          {
            emailQuery: {
              emailAddress,
              method: "TEXT_QUERY_METHOD_EQUALS",
            },
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    const errorMessage = errorData.message.split("(")[0].trim();
    throw new Error(errorMessage || "User not found");
  }

  return response.json();
};

export const createSession = async (
  userId: string
): Promise<SessionResponse> => {
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
            userId,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    const errorMessage = errorData.message.split("(")[0].trim();
    throw new Error(errorMessage || "Failed to create session");
  }

  return response.json();
};

export const getUserDetails = async (
  sessionId: string
): Promise<UserDetails> => {
  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }

  return response.json();
};

export const verifyPassword = async (
  sessionId: string,
  sessionToken: string,
  password: string
): Promise<SessionResponse> => {
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
    throw new Error(errorMessage || "Invalid password");
  }

  return response.json();
};

export const verifyUserEmail = async (
  userId: string,
  verificationCode: string
): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users/${userId}/email/verify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        verificationCode,
      }),
    }
  );

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    const errorMessage = errorData.message?.split("(")[0].trim();
    throw new Error(errorMessage || "Failed to verify email");
  }

  return response.json();
};

export const checkEmailVerification = async (
  userId: string
): Promise<boolean> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users/${userId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check email verification status");
  }

  const userData = (await response.json()) as UserDetails;
  return userData.user.human.email.isVerified;
};

export const resendVerificationEmail = async (
  userId: string,
  sessionToken: string
): Promise<void> => {
  if (!userId || !sessionToken) {
    throw new Error("User ID and session token are required");
  }

  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users/${userId}/email/send`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        sendCode: {
          urlTemplate: `${
            import.meta.env.VITE_PUBLIC_URL
          }/auth/verify?userID={{.UserID}}&code={{.Code}}&orgID={{.OrgID}}`,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = (await response.json()) as ErrorResponse;
    throw new Error(errorData.message || "Failed to resend verification email");
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
