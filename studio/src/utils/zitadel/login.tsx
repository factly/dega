import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { checkTOTP } from "../../actions/mfa";
import { useGoogleSignIn } from "./idp";
import { TOTPSetupComponent } from "./mfa";
import {
  createSession,
  getUserDetails,
  verifyPassword,
  finalizeAuthRequest,
  checkUser,
  checkEmailVerification,
  resendVerificationEmail,
} from "../../actions/login";
import { requestPasswordReset } from "../../actions/forgotPassword";
import EmailInput from "./login/EmailInput";
import Password from "./login/Password";
import Mfa from "./login/Mfa";
import MfaVerify from "./login/MfaVerify";
import RequestReset from "./login/RequestReset";
import AuthLayout from "./AuthLayout";
import AuthHeader from "./AuthHeader";
import EmailVerification from "./login/EmailVerification";
import degaImage from "../../assets/dega-1.png";
import { SessionData, UserDetails, AuthMethods, FinalizeResult } from "./types";

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<string>("email");
  const [sessionId, setSessionId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [totpCode, setTotpCode] = useState<string>("");
  const [mfaCode, setMfaCode] = useState<string>("");
  const [authRequestId, setAuthRequestId] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const location = useLocation();

  const {
    initiateGoogleSignIn,
    error: googleError,
    step: googleStep,
    totpUri,
    totpSecret,
    handleMfaSetup,
    handleMfaVerify,
  } = useGoogleSignIn();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authRequest = searchParams.get("authRequest");
    if (authRequest) {
      setAuthRequestId(authRequest);
      localStorage.setItem("authRequestId", authRequest);
    }
  }, [location]);

  useEffect(() => {
    if (googleError) {
      setError(googleError);
    }
  }, [googleError]);

  useEffect(() => {
    if (googleStep === "mfa-setup" || googleStep === "mfa-verify") {
      setStep(googleStep);
    }
  }, [googleStep]);

  const getAuthMethods = async (userId: string): Promise<AuthMethods> => {
    const response = await fetch(
      `${
        import.meta.env.VITE_ZITADEL_AUTHORITY
      }/v2/users/${userId}/authentication_methods`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("sessionToken")}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch authentication methods");
    }
    return response.json();
  };

  const handleEmailSubmit = async (values: {
    email: string;
  }): Promise<void> => {
    setError("");
    setIsLoading(true);
    try {
      const users = await checkUser(values.email);
      if (users.result && users.result.length > 0) {
        const sessionData: SessionData = await createSession(
          users.result[0].userId
        );
        localStorage.setItem("sessionData", JSON.stringify(sessionData));
        setSessionId(sessionData.sessionId);
        localStorage.setItem("sessionToken", sessionData.sessionToken);

        const userDetails: UserDetails = await getUserDetails(
          sessionData.sessionId
        );
        const userId = userDetails.session.factors.user.id;
        setUserId(userId);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userEmail", values.email);

        const isEmailVerified = await checkEmailVerification(userId);
        if (!isEmailVerified) {
          setStep("verify-email");
          return;
        }

        setStep("password");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (): Promise<void> => {
    setError("");
    setIsLoading(true);
    try {
      await resendVerificationEmail(userId);
      setError("Verification email has been resent. Please check your inbox.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to resend verification email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (values: {
    password: string;
  }): Promise<void> => {
    setError("");
    setIsLoading(true);
    try {
      const sessionData: SessionData = JSON.parse(
        localStorage.getItem("sessionData") || "{}"
      );
      const result = await verifyPassword(
        sessionId,
        sessionData.token,
        values.password
      );
      localStorage.setItem("sessionToken", result.sessionToken);

      const authMethods = await getAuthMethods(userId);
      if (
        authMethods.authMethodTypes &&
        authMethods.authMethodTypes.includes("AUTHENTICATION_METHOD_TYPE_TOTP")
      ) {
        setStep("mfa");
      } else {
        await finalizeLogin(result.sessionToken);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Invalid password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (): Promise<void> => {
    setError("");
    try {
      await requestPasswordReset(userId);
      setStep("reset-message");
    } catch (error) {
      setError(
        `An error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleMfaSubmit = async (values: {
    totpCode: string;
  }): Promise<void> => {
    setError("");
    setIsLoading(true);

    try {
      const sessionData: SessionData = JSON.parse(
        localStorage.getItem("sessionData") || "{}"
      );
      const result = await checkTOTP(
        sessionId,
        sessionData.token,
        values.totpCode
      );
      if (result.sessionToken) {
        localStorage.setItem("sessionToken", result.sessionToken);
        await finalizeLogin(result.sessionToken);
      } else {
        setError("Invalid MFA code. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred during MFA verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerifySubmit = (values: { mfaCode: string }): void => {
    handleMfaVerify(values.mfaCode);
  };

  const handleSkipMfa = async (): Promise<void> => {
    try {
      const sessionToken = localStorage.getItem("sessionToken");
      if (!sessionToken) {
        throw new Error("No session token found");
      }
      await finalizeLogin(sessionToken);
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred while skipping MFA");
    }
  };

  const finalizeLogin = async (sessionToken: string): Promise<void> => {
    try {
      if (!sessionToken) {
        throw new Error("No session token provided");
      }
      const authRequestId = localStorage.getItem("authRequestId");
      const finalizeResult: FinalizeResult = await finalizeAuthRequest(
        authRequestId || "",
        sessionId,
        sessionToken
      );

      if (finalizeResult.callbackUrl) {
        window.location.href = finalizeResult.callbackUrl;
      } else {
        console.error("No callback URL in the response");
        setError("Login successful, but redirect failed. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        `An unexpected error occurred during login finalization: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    const result = await initiateGoogleSignIn();
    if (result && result.error) {
      setError(result.error);
    }
  };

  const resetLoginProcess = (): void => {
    setEmail("");
    setPassword("");
    setError("");
    setStep("email");
    setSessionId("");
    setUserId("");
    setTotpCode("");
    setMfaCode("");
    localStorage.removeItem("sessionData");
    localStorage.removeItem("sessionToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
  };

  const getHeaderContent = () => {
    switch (step) {
      case "email":
        return {
          title: "Hey there!",
          subtitle: "Let's get started by using your email",
        };
      case "password":
        return {
          title: "Welcome back!",
          subtitle: "Use your password to continue",
        };
      case "verify-email":
        return {
          title: "Verify your email",
          subtitle: "Please check your inbox for verification",
        };
      case "reset-request":
        return {
          title: "Reset Password",
          subtitle: "Enter your email to receive reset instructions",
        };
    }
  };

  const renderForm = () => {
    const headerContent = getHeaderContent();

    switch (step) {
      case "email":
        return (
          <>
            <AuthHeader {...headerContent} />
            <EmailInput
              email={email}
              setEmail={setEmail}
              onSubmit={handleEmailSubmit}
              error={error}
              handleGoogleSignIn={handleGoogleSignIn}
            />
          </>
        );

      case "verify-email":
        return (
          <>
            <AuthHeader {...headerContent} />
            <EmailVerification
              userEmail={localStorage.getItem("userEmail") || ""}
              userId={userId}
              onResendVerification={handleResendVerification}
              error={error}
            />
          </>
        );
      case "password":
        return (
          <>
            <AuthHeader {...headerContent} />
            <Password
              password={password}
              setPassword={setPassword}
              onSubmit={handlePasswordSubmit}
              onForgotPassword={() => setStep("reset-request")}
            />
          </>
        );
      case "reset-request":
        return (
          <>
            <AuthHeader {...headerContent} />
            <RequestReset userEmail={email} onSubmit={handleRequestReset} />
          </>
        );
      case "reset-message":
        return (
          <Card className="w-full">
            <CardContent className="text-center p-6 space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-gray-600">
                We've sent password reset instructions to your email address.
                Please check your inbox and follow the link to reset your
                password.
              </p>
            </CardContent>
          </Card>
        );
      case "mfa":
        return (
          <Mfa
            totpCode={totpCode}
            setTotpCode={setTotpCode}
            onSubmit={handleMfaSubmit}
          />
        );
      case "mfa-setup":
        return (
          <TOTPSetupComponent
            uri={totpUri}
            secret={totpSecret}
            onVerify={handleMfaSetup}
          />
        );
      case "mfa-verify":
        return (
          <MfaVerify
            mfaCode={mfaCode}
            setMfaCode={setMfaCode}
            onSubmit={handleMfaVerifySubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      error={error}
      showBackButton={step !== "email"}
      onBackClick={resetLoginProcess}
      logoSrc={degaImage}
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {renderForm()}
    </AuthLayout>
  );
};

export default Login;
