interface OpenIDConfiguration {
  data?: any;
  error?: string;
}

interface LoginResponse {
  authorizeURL?: string;
  error?: string;
}

interface TokenResponse {
  data?: any;
  error?: string;
}

interface UserInfoResponse {
  data?: any;
  error?: string;
}

export const login = async (): Promise<LoginResponse> => {
  try {
    const d = await getOpenIDConfiguration();
    if (d.error) {
      console.log(d.error);
      return { error: d.error };
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    localStorage.setItem("code_verifier", codeVerifier);

    const state = generateRandomString();
    localStorage.setItem("auth_state", state);

    const authorizeURL =
      `${import.meta.env.VITE_DEGA_PUBLIC_URL}/auth/request?` +
      `client_id=${encodeURIComponent(
        import.meta.env.VITE_ZITADEL_CLIENT_ID
      )}` +
      `&response_type=code` +
      `&response_mode=query` +
      `&code_challenge_method=S256` +
      `&redirect_uri=${encodeURIComponent(
        import.meta.env.VITE_ZITADEL_REDIRECT_URI
      )}` +
      `&post_logout_redirect_uri=${encodeURIComponent(
        import.meta.env.VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI
      )}` +
      `&state=${state}` +
      `&scope=${encodeURIComponent(
        "openid profile email urn:zitadel:iam:user:metadata urn:zitadel:iam:user:resourceowner urn:zitadel:iam:org:project:id:zitadel:aud urn:zitadel:iam:org:project:" +
          import.meta.env.VITE_ZITADEL_PROJECT_ID +
          ":roles"
      )}` +
      `&code_challenge=${encodeURIComponent(codeChallenge)}`;

    return { authorizeURL };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Login failed" };
  }
};

export const getToken = async (
  code: string,
  state?: string | null
): Promise<TokenResponse> => {
  try {
    if (!code) {
      return { error: "No authorization code provided" };
    }

    // Verify state parameter
    const storedState = localStorage.getItem("auth_state");
    if (state && storedState && state !== storedState) {
      return { error: "Invalid state parameter" };
    }

    // Get code verifier
    const codeVerifier = localStorage.getItem("code_verifier");
    if (!codeVerifier) {
      return { error: "Code verifier not found" };
    }

    const response = await fetch(
      `${import.meta.env.VITE_ZITADEL_AUTHORITY}/oauth/v2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: import.meta.env.VITE_ZITADEL_CLIENT_ID,
          redirect_uri: import.meta.env.VITE_ZITADEL_REDIRECT_URI,
          code_verifier: codeVerifier,
          grant_type: "authorization_code",
        }).toString(),
        credentials: "include",
      }
    );

    if (!response.ok) {
      // Try to get more detailed error information
      try {
        const errorData = await response.json();
        console.error("Token exchange error:", errorData);
        return {
          error:
            errorData.error_description ||
            errorData.error ||
            `Token request failed: ${response.status}`,
        };
      } catch (e) {
        return { error: `Token request failed: ${response.status}` };
      }
    }

    const data = await response.json();
    if (data.error) {
      return { error: data.error_description || data.error };
    }

    // Store tokens
    if (data.access_token) {
      localStorage.setItem("sessionToken", data.access_token);
    } else {
      return { error: "No access token received" };
    }

    if (data.id_token) {
      localStorage.setItem("x-zitadel-id-token", data.id_token);
    }

    return { data };
  } catch (error) {
    console.error("Token error:", error);
    return {
      error: error instanceof Error ? error.message : "Error fetching token",
    };
  }
};

export const getUserInfo = async (): Promise<UserInfoResponse> => {
  try {
    const token = localStorage.getItem("sessionToken");
    if (!token) {
      return { error: "No session token found" };
    }

    const response = await fetch(
      `${import.meta.env.VITE_ZITADEL_AUTHORITY}/oidc/v1/userinfo`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      }
    );

    if (response.status === 200) {
      const data = await response.json();
      return { data };
    }
  } catch (error) {
    console.error("UserInfo error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Error fetching user info",
    };
  }
};

const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

function generateCodeVerifier(length: number = 128): string {
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  return btoa(String.fromCharCode(...randomArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generateRandomString(length: number = 128): string {
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  return btoa(String.fromCharCode(...randomArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const getOpenIDConfiguration = async (): Promise<OpenIDConfiguration> => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_ZITADEL_AUTHORITY
      }/.well-known/openid-configuration`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const config = await response.json();
    return { data: config };
  } catch (error) {
    console.error("OpenID Configuration error:", error);
    return {
      error: "Error fetching OpenID configuration",
    };
  }
};
