import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  startTOTPRegistration,
  verifyTOTPRegistration,
  checkTOTP,
} from "@/actions/mfa";
import {
  getProviderInformation,
  checkUserExists,
  linkExistingUser,
  createSession,
  registerUser,
  initiateGoogleSignIn,
} from "../../actions/idp";
import type {
  ProviderInformation,
  ProviderUserData,
  ExistingUser,
} from "./types";

type Step = "initial" | "mfa-setup" | "mfa-verify";

interface UseGoogleSignInReturn {
  initiateGoogleSignIn: () => Promise<void>;
  error: string | null;
  step: Step;
  totpUri: string;
  totpSecret: string;
  handleMfaSetup: (code: string) => Promise<void>;
  handleMfaVerify: (code: string) => Promise<void>;
}

export const useGoogleSignIn = (): UseGoogleSignInReturn => {
  const location = useLocation();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("initial");
  const [totpUri, setTotpUri] = useState<string>("");
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");

  const params = new URLSearchParams(location.search);
  const intentId = params.get("id");
  const token = params.get("token");
  const userId = params.get("user");

  const showError = (message: string) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: message,
      icon: <AlertCircle className="h-5 w-5" />,
    });
    setError(message);
  };

  useEffect(() => {
    if (intentId && token) {
      handleProviderInformation(intentId, token);
    }
  }, [location]);

  const handleProviderInformation = async (
    intentId: string,
    token: string
  ): Promise<void> => {
    try {
      const providerData = await getProviderInformation(intentId, token);
      await handleAuthenticationFlow(providerData, intentId, token);
    } catch (error) {
      console.error("Error:", error);
      showError("An error occurred. Please try again later.");
    }
  };

  const handleAuthenticationFlow = async (
    providerData: ProviderInformation,
    intentId: string,
    token: string
  ): Promise<void> => {
    const email = providerData.idpInformation?.rawInformation?.User?.email;

    try {
      if (userId) {
        await loginUser(userId, intentId, token);
      } else if (email) {
        const existingUser = await checkUserExists(email);
        if (existingUser) {
          await handleExistingUser(existingUser, providerData, intentId, token);
        } else {
          const userData = providerData.idpInformation?.rawInformation?.User;
          if (userData) {
            await handleNewUser(userData, intentId, token);
          } else {
            throw new Error("Invalid user data received");
          }
        }
      } else {
        throw new Error("Unable to determine user email");
      }
    } catch (error) {
      console.error("Error:", error);
      showError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again later."
      );
    }
  };

  const handleExistingUser = async (
    existingUser: ExistingUser,
    providerData: ProviderInformation,
    intentId: string,
    token: string
  ): Promise<void> => {
    try {
      await linkExistingUser(existingUser.userId, providerData);
      const sessionData = await createSession(existingUser.userId);
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);
      setStep("mfa-verify");
    } catch (error) {
      console.error("Error handling existing user:", error);
      showError(
        "An error occurred while linking your account. Please try again later."
      );
    }
  };

  const loginUser = async (
    userId: string,
    intentId: string,
    token: string
  ): Promise<void> => {
    try {
      const sessionData = await createSession(userId, intentId, token);
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);
      setStep("mfa-verify");
    } catch (error) {
      console.error("Error:", error);
      showError("An error occurred during login. Please try again later.");
    }
  };

  const handleNewUser = async (
    userData: ProviderUserData,
    intentId: string,
    token: string
  ): Promise<void> => {
    try {
      const newUserData = await registerUser(userData, intentId, token);
      localStorage.setItem("userId", newUserData.userId);

      const sessionData = await createSession(
        newUserData.userId,
        intentId,
        token
      );
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);

      const totpData = await startTOTPRegistration(
        newUserData.userId,
        import.meta.env.VITE_ZITADEL_PAT
      );
      setTotpUri(totpData.uri);
      setTotpSecret(totpData.secret);
      setStep("mfa-setup");
    } catch (error) {
      console.error("Error:", error);
      showError(
        "An error occurred during registration. Please try again later."
      );
    }
  };

  const handleMfaSetup = async (code: string): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }
      await verifyTOTPRegistration(userId, sessionToken, code);
      navigate("/");
    } catch (error) {
      console.error("Error verifying MFA:", error);
      showError("Failed to verify MFA. Please try again.");
    }
  };

  const handleMfaVerify = async (code: string): Promise<void> => {
    try {
      const result = await checkTOTP(sessionId, sessionToken, code);
      if (result.sessionToken) {
        localStorage.setItem("sessionToken", result.sessionToken);
        navigate("/");
      } else {
        showError("Invalid MFA code. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying MFA:", error);
      showError("Failed to verify MFA. Please try again.");
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      const data = await initiateGoogleSignIn(import.meta.env.VITE_PUBLIC_URL);
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Error:", error);
      showError("An error occurred. Please try again later.");
    }
  };

  return {
    initiateGoogleSignIn: handleGoogleSignIn,
    error,
    step,
    totpUri,
    totpSecret,
    handleMfaSetup,
    handleMfaVerify,
  };
};
