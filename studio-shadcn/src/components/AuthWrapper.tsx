import React, { useEffect, ReactNode, useCallback } from "react";
import { useDispatch } from "react-redux";
import { getSession } from "../actions/session";
import { login } from "../utils/zitadel";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

// Type definitions
interface AuthWrapperProps {
  children: ReactNode;
}

interface SessionResponse {
  success: boolean;
  noToken?: boolean;
}

interface LoginResponse {
  authorizeURL?: string;
  error?: string;
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
  const location = window.location;

  const isPublicPath = (path: string): boolean => {
    return publicPaths.some((publicPath) => path.includes(publicPath));
  };

  const checkAuthenticated = useCallback(async (): Promise<void> => {
    try {
      const res: SessionResponse = await dispatch(getSession());

      if (res.success) {
        return;
      }
      if (isPublicPath(location.pathname)) {
        return;
      }

      // Check for authRequest parameter
      const searchParams = new URLSearchParams(window.location.search);
      const authRequest = searchParams.get("authRequest");
      if (authRequest) {
        return;
      }

      // Store the return URL for post-login redirect
      window.localStorage.setItem("return_to", window.location.href);

      // Initiate login process
      const loginResponse: LoginResponse = await login();

      if (loginResponse.error) {
        console.error("Login error:", loginResponse.error);
        window.location.href = "/auth/login";
        return;
      }

      if (loginResponse.authorizeURL) {
        window.location.href = loginResponse.authorizeURL;
      } else {
        console.error("No authorize URL returned");
        window.location.href = "/auth/login";
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      // Redirect to login page on error
      if (!isPublicPath(location.pathname)) {
        window.location.href = "/auth/login";
      }
    }
  }, [dispatch, location.pathname]);

  useEffect(() => {
    void checkAuthenticated();
  }, [checkAuthenticated]);

  return <>{children}</>;
};

export default AuthWrapper;
