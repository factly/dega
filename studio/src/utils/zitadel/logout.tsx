export const logout = async (): Promise<void> => {
  const sessionId = localStorage.getItem("sessionId");
  const sessionToken = localStorage.getItem("sessionToken");

  if (sessionId && sessionToken) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ sessionToken }),
        }
      );

      if (!response.ok) {
        console.error("Logout failed:", await response.text());
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  window.localStorage.clear();

  const postLogoutRedirectUri = import.meta.env
    .VITE_ZITADEL_POST_LOGOUT_REDIRECT_URI;
  if (postLogoutRedirectUri) {
    window.location.href = postLogoutRedirectUri;
  } else {
    window.location.reload();
  }
};

export const isAuthenticated = (): boolean => {
  const sessionToken = localStorage.getItem("sessionToken");
  return !!sessionToken;
};
