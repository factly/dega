import React, { useEffect, ReactNode, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { getSession } from "../actions/session";
import { login, getToken } from "../utils/zitadel";
import { addErrorNotification } from "../actions/notifications";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

// Type definitions
interface AuthWrapperProps {
  children: ReactNode;
}

// List of public paths that don't require authentication
const publicPaths: string[] = [
  "/auth/login",
  "/auth/registration",
  "/auth/login/recovery",
  "/redirect",
  "/auth/verify",
  "/callback",
];

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
  const location = useLocation();

  const isPublicPath = (path: string): boolean => {
    return publicPaths.some((publicPath) => path.includes(publicPath));
  };

  // Handle callback with auth code
  const handleCallback = useCallback(async (): Promise<boolean> => {
    // Check if we're in a callback situation with an authorization code
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (code) {
      try {
        const tokenResponse = await getToken(code, state);

        if (tokenResponse.error) {
          dispatch(
            addErrorNotification({
              message: `Token exchange error: ${tokenResponse.error}`,
            })
          );
          return false;
        }

        // Token exchange successful, redirect to return_to if available
        const returnTo = localStorage.getItem("return_to");
        if (returnTo) {
          localStorage.removeItem("return_to");
          window.location.href = returnTo;
          return true;
        }

        return true;
      } catch (error) {
        console.error("Token exchange error:", error);
        dispatch(
          addErrorNotification({
            message: "Failed to exchange authorization code for token",
          })
        );
        return false;
      }
    }

    return false;
  }, [dispatch]);

  const checkAuthenticated = useCallback(async (): Promise<void> => {
    try {
      // First check if we're handling a callback with code
      const isHandlingCallback = await handleCallback();
      if (isHandlingCallback) {
        // If we're handling a callback, we don't need to continue with the rest of the authentication check
        return;
      }

      const res = await dispatch(getSession());

      if (!res.success) {
        // If there's no token or authentication failed
        if (!res.noToken) {
          const currentURL = window.location.href;
          const searchParams = new URLSearchParams(window.location.search);
          const authRequest = searchParams.get("authRequest");

          // If current path is public and has authRequest, allow access
          if (
            isPublicPath(currentURL) &&
            (currentURL.includes("/redirect") || authRequest)
          ) {
            return;
          }

          // Store the return URL for post-login redirect
          if (!isPublicPath(location.pathname)) {
            window.localStorage.setItem("return_to", window.location.href);
          }

          const loginResponse = await login();

          if (loginResponse.error) {
            dispatch(
              addErrorNotification({
                message: loginResponse.error,
              })
            );
            return;
          }

          if (loginResponse.authorizeURL) {
            window.location.href = loginResponse.authorizeURL;
          } else {
            dispatch(
              addErrorNotification({
                message: "No authorize URL returned",
              })
            );
          }
        }
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      dispatch(
        addErrorNotification({
          message: "Authentication check failed",
        })
      );

      // Redirect to login page on error
      if (!isPublicPath(location.pathname)) {
        window.location.href = "/auth/login";
      }
    }
  }, [dispatch, location.pathname, handleCallback]);

  useEffect(() => {
    void checkAuthenticated();
  }, [checkAuthenticated]);

  // Return children directly rather than wrapping in a fragment
  return children;
};

export default AuthWrapper;
