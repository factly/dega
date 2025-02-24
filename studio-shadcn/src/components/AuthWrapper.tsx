import React, { useEffect, ReactNode } from "react";
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
  authorizeURL: string;
}

// List of public paths that don't require authentication
const publicPaths: string[] = [
  "/auth/login",
  "/auth/registration",
  "/auth/login/recovery",
  "/redirect",
  "/auth/verify",
];

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
  const location = window.location;

  const isPublicPath = (path: string): boolean => {
    return publicPaths.some((publicPath) => path.includes(publicPath));
  };

  const checkAuthenticated = async (): Promise<void> => {
    try {
      const res: SessionResponse = await dispatch(getSession());

      if (!res.success) {
        // If there's no token or authentication failed
        if (!res.noToken) {
          const currentURL = window.location.href;
          const searchParams = new URLSearchParams(window.location.search);
          const authRequest = searchParams.get("authRequest");

          // If current path is public and has authRequest, allow access
          if (isPublicPath(currentURL) && authRequest) {
            return;
          }

          // Store the return URL for post-login redirect
          if (!isPublicPath(location.pathname)) {
            window.localStorage.setItem("return_to", window.location.href);
            window.location.href = "/auth/login";
          }

          // Initiate login process
          const loginResponse: LoginResponse = await login();
          window.location.href = loginResponse.authorizeURL;
        }
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
    }
  };

  useEffect(() => {
    void checkAuthenticated();
  }, [location.pathname]);

  return <>{children}</>;
};

export default AuthWrapper;
