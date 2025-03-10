import type {
  ProviderInformation,
  UserSearchResult,
  SessionData,
  UserQuery,
  IdpLinkRequest,
  SessionRequest,
  HumanUserRegistration,
  GoogleSignInRequest,
  AuthRequestDetails,
  AuthRequestFinalization,
  ApiResponse,
} from "./types";

export const getProviderInformation = async (
  intentId: string,
  token: string
): Promise<ProviderInformation> => {
  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/idp_intents/${intentId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        idpIntentToken: token,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get provider information");
  }

  return response.json();
};

export const checkUserExists = async (
  email: string
): Promise<UserSearchResult["result"][0] | null> => {
  const userQuery: UserQuery = {
    query: {
      offset: "0",
      limit: 1,
      asc: true,
    },
    queries: [
      {
        emailQuery: {
          emailAddress: email,
          method: "TEXT_QUERY_METHOD_EQUALS",
        },
      },
    ],
  };

  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify(userQuery),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check user existence");
  }

  const data: UserSearchResult = await response.json();
  if (data.result && data.result.length > 0) {
    const userId = data.result[0].userId;
    localStorage.setItem("userId", userId);
    return data.result[0];
  }
  return null;
};

export const linkExistingUser = async (
  userId: string,
  providerData: ProviderInformation
): Promise<void> => {
  const linkRequest: IdpLinkRequest = {
    idpLink: {
      idpId: import.meta.env.VITE_ZITADEL_IDP_ID,
      userId: providerData.idpInformation?.rawInformation?.User?.sub || "",
      userName: providerData.idpInformation?.rawInformation?.User?.name || "",
    },
  };

  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users/${userId}/links`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify(linkRequest),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to link user to IDP");
  }
};

export const createSession = async (
  userId: string,
  intentId: string | null = null,
  token: string | null = null
): Promise<SessionData> => {
  const sessionRequest: SessionRequest = {
    checks: {
      user: {
        userId,
      },
    },
  };

  if (intentId && token) {
    sessionRequest.checks.idpIntent = {
      idpIntentId: intentId,
      idpIntentToken: token,
    };
  }

  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/sessions`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify(sessionRequest),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  return response.json();
};

export const registerUser = async (
  userData: {
    email: string;
    given_name: string;
    family_name: string;
    name: string;
    email_verified: boolean;
    sub: string;
  },
  intentId: string,
  token: string
): Promise<ApiResponse<any>> => {
  const registrationData: HumanUserRegistration = {
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
        idpId: import.meta.env.VITE_ZITADEL_IDP_ID,
        idpExternalId: userData.sub,
        userId: userData.sub,
        userName: userData.email,
      },
    ],
  };

  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users/human`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify(registrationData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register user");
  }

  return response.json();
};

export const initiateGoogleSignIn = async (): Promise<
  ApiResponse<{ authUrl: string }>
> => {
  const signInRequest: GoogleSignInRequest = {
    idpId: import.meta.env.VITE_ZITADEL_IDP_ID,
    urls: {
      successUrl: `${import.meta.env.VITE_PUBLIC_URL}/auth/login`,
      failureUrl: `${import.meta.env.VITE_PUBLIC_URL}`,
    },
  };

  const response = await fetch(
    `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/idp_intents`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
      },
      body: JSON.stringify(signInRequest),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to initiate Google Sign-In");
  }

  return response.json();
};

export const getAuthRequestDetails = async (
  authRequestId: string
): Promise<AuthRequestDetails> => {
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
): Promise<{ callbackUrl: string }> => {
  const finalizationData: AuthRequestFinalization = {
    session: {
      sessionId,
      sessionToken,
    },
  };

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
      body: JSON.stringify(finalizationData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Error finalizing auth request:", errorData);
    throw new Error(
      "Failed to finalize auth request: " +
        (errorData.message || response.statusText)
    );
  }

  return response.json();
};
