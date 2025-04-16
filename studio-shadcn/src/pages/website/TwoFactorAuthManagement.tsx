import React, { useState, useEffect } from "react";
import { TOTPSetupComponent } from "../../utils/zitadel/mfa";
import {
  startTOTPRegistration,
  verifyTOTPRegistration,
} from "../../actions/mfa";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import PasswordInput from "../../components/PasswordInput/index";
import { AuthMethods } from "./types";

const TwoFactorAuthManagement: React.FC = () => {
  const [isSettingUp2FA, setIsSettingUp2FA] = useState<boolean>(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [totpUri, setTotpUri] = useState<string>("");
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPasswordHidden, setIsPasswordHidden] = useState<boolean>(false);

  useEffect(() => {
    const check2FAStatus = async (): Promise<void> => {
      const userId = localStorage.getItem("userId");
      try {
        if (userId) {
          const authMethods = await getAuthMethods(userId);
          if (
            authMethods.authMethodTypes &&
            authMethods.authMethodTypes.includes(
              "AUTHENTICATION_METHOD_TYPE_TOTP"
            )
          ) {
            setIs2FAEnabled(true);
          } else {
            setIs2FAEnabled(false);
          }
        }
      } catch (error) {
        console.error("Error checking 2FA status:", error);
      }
    };

    check2FAStatus();
  }, []);

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
    const data = await response.json();
    return data;
  };

  const handleEnable2FA = async (): Promise<void> => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("sessionToken");
    try {
      if (userId && token) {
        const result = await startTOTPRegistration(userId, token);
        setTotpUri(result.uri);
        setTotpSecret(result.secret);
        setIsSettingUp2FA(true);
      }
    } catch (error) {
      console.error("Error starting 2FA setup:", error);
      setErrorMessage("Failed to start 2FA setup. Please try again.");
    }
  };

  const handleVerify2FA = async (code: string): Promise<void> => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("sessionToken");
    try {
      if (userId && token) {
        await verifyTOTPRegistration(userId, token, code);
        setIsSettingUp2FA(false);
        setIs2FAEnabled(true);
        setSuccessMessage("Two-factor authentication is successfully enabled.");
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      setErrorMessage("Failed to verify 2FA. Please try again.");
    }
  };

  const handleDisable2FA = async (): Promise<void> => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("sessionToken");
    try {
      if (userId && token) {
        const response = await fetch(
          `${import.meta.env.VITE_ZITADEL_AUTHORITY}/v2/users/${userId}/totp`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          setIsSettingUp2FA(false);
          setIs2FAEnabled(false);
          setSuccessMessage("Two-factor authentication has been disabled.");
        } else {
          throw new Error("Failed to disable 2FA.");
        }
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      setErrorMessage("Failed to disable 2FA. Please try again.");
    }
  };

  const handlePasswordChange = async (): Promise<void> => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const token = localStorage.getItem("sessionToken");

    try {
      if (token) {
        const response = await fetch(
          `${import.meta.env.VITE_ZITADEL_AUTHORITY}/auth/v1/users/me/password`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              oldPassword: oldPassword,
              newPassword: newPassword,
            }),
          }
        );

        if (response.ok) {
          setSuccessMessage("Password changed successfully.");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          const errorData = await response.json();
          const errorMessage = errorData.message.split("(")[0].trim();
          throw new Error(errorMessage || "Failed to change password");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unknown error occurred");
      }
    }
  };

  const togglePasswordVisibility = (): void => {
    setIsPasswordHidden(!isPasswordHidden);
  };

  return (
    <div className="w-full h-screen flex justify-center">
      <div className="w-full max-w-3xl p-8 flex flex-col gap-4 max-h-screen overflow-y-auto">
        <h1 className="text-2xl font-semibold">Security</h1>

        {successMessage && (
          <Alert
            variant="default"
            className="bg-emerald-50 text-emerald-600 border-emerald-600"
          >
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="w-full flex flex-col gap-16 mt-4">
          <div className="w-full flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Change Password</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePasswordVisibility}
                className="text-gray-500 hover:text-gray-800"
              >
                {isPasswordHidden ? (
                  <Eye className="h-4 w-4 mr-2" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-2" />
                )}
                {isPasswordHidden ? "Change password" : "Hide"}
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="w-full flex flex-col gap-4">
              {!isPasswordHidden && (
                <>
                  <PasswordInput
                    id="old-password"
                    name="oldPassword"
                    label="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter old password"
                    required
                  />
                  <PasswordInput
                    id="new-password"
                    name="newPassword"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <PasswordInput
                    id="confirm-password"
                    name="confirmPassword"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    error={
                      newPassword !== confirmPassword && confirmPassword
                        ? "Passwords do not match"
                        : undefined
                    }
                  />
                  <div className="flex justify-start mt-2">
                    <Button onClick={handlePasswordChange}>
                      Change Password
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-full flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Manage Two Factor Authentication
              </h2>
              {is2FAEnabled && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-600 border-emerald-600"
                >
                  Enabled
                </Badge>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-start">
              {is2FAEnabled ? (
                <Button variant="destructive" onClick={handleDisable2FA}>
                  Disable 2FA
                </Button>
              ) : (
                <>
                  {isSettingUp2FA ? (
                    <div className="w-full">
                      <TOTPSetupComponent
                        uri={totpUri}
                        secret={totpSecret}
                        onVerify={handleVerify2FA}
                      />
                    </div>
                  ) : (
                    <Button
                      className="hover:bg-black"
                      onClick={handleEnable2FA}
                    >
                      Enable 2FA
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthManagement;
