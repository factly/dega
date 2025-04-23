import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define types for the verification status
type VerificationStatus = "verifying" | "success" | "failed";

// Interface for error state
interface VerificationError {
  message: string;
}

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [error, setError] = useState<string>("");
  const verificationAttempted = useRef<boolean>(false);

  useEffect(() => {
    const verifyEmail = async (): Promise<void> => {
      // Return early if verification was already attempted
      if (verificationAttempted.current) return;

      try {
        const params = new URLSearchParams(location.search);
        const userId = params.get("userID");
        const code = params.get("code");

        if (!userId || !code) {
          setStatus("failed");
          setError("Missing verification parameters");
          return;
        }

        // Set the flag before making the API call
        verificationAttempted.current = true;

        const response = await fetch(
          `${
            import.meta.env.VITE_ZITADEL_AUTHORITY
          }/v2/users/${userId}/email/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_ZITADEL_PAT}`,
            },
            body: JSON.stringify({
              verificationCode: code,
            }),
          }
        );

        if (!response.ok) {
          const errorData = (await response.json()) as VerificationError;
          throw new Error(
            errorData.message?.split("(")[0].trim() || "Verification failed"
          );
        }

        await response.json();
        setStatus("success");

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/auth/login");
        }, 3000);
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("failed");
        setError(
          error instanceof Error
            ? error.message
            : "Verification failed. Please try again or contact support."
        );
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  const renderContent = (): React.ReactNode => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-primary" />
            <h2 className="text-2xl font-semibold mt-6">
              Verifying your email
            </h2>
            <p className="text-muted-foreground mt-2">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
            <h2 className="text-2xl font-semibold mt-6">Email Verified!</h2>
            <p className="text-muted-foreground mt-2">
              Your email has been successfully verified.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Redirecting to login page...
            </p>
            <Button
              onClick={() => navigate("/auth/login")}
              className="mt-6 w-full md:w-auto"
            >
              Go to Login
            </Button>
          </div>
        );

      case "failed":
        return (
          <div className="text-center">
            <XCircle className="h-16 w-16 mx-auto text-destructive" />
            <h2 className="text-2xl font-semibold mt-6">Verification Failed</h2>
            <p className="text-muted-foreground mt-2">{error}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please try clicking the verification link again or request a new
              verification email.
            </p>
            <Button
              onClick={() => navigate("/auth/login")}
              className="mt-6 w-full md:w-auto"
            >
              Return to Login
            </Button>
          </div>
        );

      default:
        return <></>;
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-background rounded-lg shadow-lg p-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmail;
