import { FC, useEffect, useState } from "react";
import { getToken, getUserInfo } from "./index";
import { useLocation } from "react-router-dom";
import Loader from "@/components/Loader";

const Callback: FC = () => {
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) {
          setError("No authorization code received");
          return;
        }

        const tokenResponse = await getToken(code, state);

        if (tokenResponse.error) {
          setError(tokenResponse.error);
          return;
        }

        const userInfoResponse = await getUserInfo();

        if (userInfoResponse.error) {
          setError(userInfoResponse.error);
          return;
        }

        const returnTo = localStorage.getItem("return_to");
        window.location.href = returnTo || "/";
      } catch (error) {
        console.error("Error during authentication callback:", error);
        setError("Authentication failed");
      }
    };

    handleCallback();
  }, [location]);

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-5">
        <div className="text-xl font-semibold text-red-600">
          Authentication Error
        </div>
        <p className="mt-2 text-center text-gray-700">{error}</p>
        <button
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => (window.location.href = "/auth/login")}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader className="h-8 w-8 animate-spin" />
    </div>
  );
};

export default Callback;
