import { FC, useEffect } from "react";
import { getToken, getUserInfo } from "./index";
import { useLocation } from "react-router-dom";

// Types for the authentication response
interface TokenResponse {
  error?: string;
  // Add other token-related fields based on your actual response
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
}

interface UserInfo {
  // Add user info fields based on your actual user data structure
  sub?: string;
  email?: string;
  name?: string;
}

const Callback: FC = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code: string | null = params.get("code");
    const state: string | null = params.get("state");

    getToken(code, state).then((response: TokenResponse) => {
      if (!response.error) {
        getUserInfo().then((userInfo: UserInfo) => {
          window.location.href = "/";
        });
      }
    });
  }, []);

  return null;
};

export default Callback;
