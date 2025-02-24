import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, RotateCw } from "lucide-react";

interface EmailVerificationProps {
  userEmail: string;
  userId: string;
  onResendVerification: () => Promise<void>;
  error?: string;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  userEmail,
  userId,
  onResendVerification,
  error,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    const savedCooldown = parseInt(
      localStorage.getItem("resendCooldown") || "0"
    );
    const cooldownEndTime = parseInt(
      localStorage.getItem("cooldownEndTime") || "0"
    );

    if (cooldownEndTime && savedCooldown) {
      const remainingTime = Math.max(
        0,
        Math.floor((cooldownEndTime - Date.now()) / 1000)
      );
      if (remainingTime > 0) {
        setResendCooldown(remainingTime);
      }
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          const newValue = prev - 1;
          if (newValue === 0) {
            localStorage.removeItem("resendCooldown");
            localStorage.removeItem("cooldownEndTime");
          }
          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [resendCooldown]);

  const handleResend = async (): Promise<void> => {
    if (resendCooldown > 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onResendVerification();

      const cooldownPeriod = 60;
      setResendCooldown(cooldownPeriod);

      const endTime = Date.now() + cooldownPeriod * 1000;
      localStorage.setItem("resendCooldown", cooldownPeriod.toString());
      localStorage.setItem("cooldownEndTime", endTime.toString());

      setStatusMessage("Verification email has been resent successfully.");
    } catch (err) {
      setStatusMessage(
        "Failed to resend verification email. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6 text-center space-y-6">
        <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-50">
          <Mail className="h-6 w-6 text-blue-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Check your email</h2>

          <div className="space-y-1">
            <p className="text-gray-600">We've sent a verification link to:</p>
            <p className="font-medium">{userEmail}</p>
            <p className="text-gray-500">
              Click the link in the email to verify your account.
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {statusMessage && (
          <Alert>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleResend}
            disabled={resendCooldown > 0 || isLoading}
            className="w-full"
          >
            <RotateCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {resendCooldown > 0
              ? `Resend available in ${resendCooldown}s`
              : "Resend verification email"}
          </Button>

          <p className="text-sm text-gray-500">
            Make sure to check your spam folder if you don't see the email.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerification;
