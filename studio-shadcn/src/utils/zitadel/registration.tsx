import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GoogleIcon from "../../assets/google-icon.svg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { TOTPSetupComponent } from "./mfa";
import {
  startTOTPRegistration,
  verifyTOTPRegistration,
} from "../../actions/mfa";
import {
  registerUser,
  createSession,
  verifyPassword,
} from "../../actions/registration";
import { useGoogleSignIn } from "./idp";
import AuthLayout from "./AuthLayout";
import degaImage from "../../assets/dega-1.png";
import AuthHeader from "./AuthHeader";
import PasswordInput from "@/components/PasswordInput";
import {RegistrationData, SessionData, TOTPData, FormValues} from "./types";

const RegistrationForm: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<
    | "registration"
    | "mfa-choice"
    | "mfa-setup"
    | "mfa-verify"
    | "verification-pending"
  >("registration");
  const [userId, setUserId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [totpUri, setTotpUri] = useState<string>("");
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [formValues, setFormValues] = useState<FormValues>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const {
    initiateGoogleSignIn,
    error: googleError,
    step: googleStep,
    totpUri: googleTotpUri,
    totpSecret: googleTotpSecret,
    handleGoogleSkipMfa,
    handleMfaSetup: handleGoogleMfaSetup,
    handleMfaVerify: handleGoogleMfaVerify,
  } = useGoogleSignIn();

  useEffect(() => {
    if (googleError) {
      setError(googleError);
    }
  }, [googleError]);

  useEffect(() => {
    if (googleStep === "mfa-setup" || googleStep === "mfa-verify") {
      setStep(googleStep);
      setTotpUri(googleTotpUri);
      setTotpSecret(googleTotpSecret);
    }
  }, [googleStep, googleTotpUri, googleTotpSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPasswordError("");

    // Check if passwords match
    if (formValues.password !== formValues.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    const registrationData: RegistrationData = {
      profile: {
        givenName: formValues.firstName,
        familyName: formValues.lastName,
      },
      email: {
        email: formValues.email,
      },
      password: {
        password: formValues.password,
      },
    };

    try {
      const registerData = await registerUser(registrationData);
      setUserId(registerData.userId);
      localStorage.setItem("userId", registerData.userId);

      const sessionData: SessionData = await createSession(formValues.email);
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);

      const verificationData = await verifyPassword(
        sessionData.sessionId,
        sessionData.sessionToken,
        formValues.password
      );
      setSessionToken(verificationData.sessionToken);

      localStorage.setItem("sessionId", sessionData.sessionId);
      localStorage.setItem("sessionToken", verificationData.sessionToken);

      setStep("mfa-choice");
    } catch (error) {
      console.error("Error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  const handleMfaChoice = async (choice: "proceed" | "skip") => {
    if (choice === "proceed") {
      try {
        const totpData: TOTPData = await startTOTPRegistration(
          userId,
          sessionToken
        );
        setTotpUri(totpData.uri);
        setTotpSecret(totpData.secret);
        setStep("mfa-setup");
      } catch (error) {
        console.error("Error starting TOTP registration:", error);
        setError("Failed to start MFA setup. Please try again.");
      }
    } else {
      setStep("verification-pending");
    }
  };

  const handleMfaVerify = async (code: string) => {
    try {
      if (step === "mfa-verify") {
        await handleGoogleMfaVerify(code);
      } else {
        await verifyTOTPRegistration(userId, sessionToken, code);
      }
      setStep("verification-pending");
    } catch (error) {
      console.error("Error verifying MFA:", error);
      setError("Failed to verify MFA. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGoogleSignIn = async () => {
    try {
      await initiateGoogleSignIn();
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred during Google Sign-In. Please try again.");
    }
  };

  const renderForm = () => {
    switch (step) {
      case "registration":
        return (
          <>
            <AuthHeader
              title="Welcome!"
              subtitle="Just fill the below details to get started"
            />
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 text-[#1D1D1D]">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Your first name"
                    value={formValues.firstName}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Your last name"
                    value={formValues.lastName}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    placeholder="Use a strong and memorable password"
                    value={formValues.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formValues.confirmPassword}
                    onChange={handleInputChange}
                    required
                    error={passwordError}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full text-[#FFFFFF]">
                Sign Up
              </Button>

              <div className="flex items-center">
                <div className="flex-grow">
                  <Separator className="bg-gray-200" />
                </div>
                <span className="px-4 text-gray-500 text-base">or</span>
                <div className="flex-grow">
                  <Separator className="bg-gray-200" />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full text-base text-[#0D1D2D]"
                onClick={handleGoogleSignIn}
              >
                <img src={GoogleIcon} alt="Google" className="mr-2 h-4 w-4" />
                Continue with Google
              </Button>

              <div className="text-center">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          </>
        );

      case "mfa-choice":
        return (
          <div className="space-y-4 text-center">
            <p>Would you like to set up Two-Factor Authentication?</p>
            <div className="flex gap-4">
              <Button
                onClick={() => handleMfaChoice("proceed")}
                className="flex-1"
              >
                Set up MFA
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleMfaChoice("skip")}
                className="flex-1"
              >
                Skip
              </Button>
            </div>
          </div>
        );

      case "mfa-setup":
      case "mfa-verify":
        return (
          <TOTPSetupComponent
            uri={totpUri}
            secret={totpSecret}
            onVerify={handleMfaVerify}
          />
        );

      case "verification-pending":
        return (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <p className="text-center">
                  We've sent you a verification email. Please check your inbox
                  and click the verification link to complete your registration.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AuthLayout logoSrc={degaImage}>
      <div className="w-full max-w-md p-6 bg-background rounded-lg">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {renderForm()}
      </div>
    </AuthLayout>
  );
};

export default RegistrationForm;
