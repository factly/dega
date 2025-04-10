import { FC, useEffect, useState } from "react";
import { getToken } from "./index";
import { getUserInfo } from "../../actions/session";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";

const Callback: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

        // Retrieve the stored return URL, defaulting to home if not found
        const returnTo = localStorage.getItem("return_to") || "/";

        // Use React Router's navigate for client-side navigation
        // This prevents a full page reload
        if (
          returnTo.startsWith(window.location.origin) ||
          returnTo.startsWith("/")
        ) {
          const path = returnTo.startsWith(window.location.origin)
            ? returnTo.slice(window.location.origin.length)
            : returnTo;
          navigate(path, { replace: true });
        } else {
          // For external URLs, we still need to use location.href
          window.location.href = returnTo;
        }
      } catch (error) {
        console.error("Error during authentication callback:", error);
        setError("Authentication failed");
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-5">
        <div className="text-xl font-semibold text-red-600">
          Authentication Error
        </div>
        <p className="mt-2 text-center text-gray-700">{error}</p>
        <Button
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={() => navigate("/auth/login", { replace: true })}
        >
          Back to Login
        </Button>
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
