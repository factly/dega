import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type {
  TOTPSetupComponentProps,
  StartTOTPRegistrationFunction,
  VerifyTOTPRegistrationFunction,
  CheckTOTP,
} from "./types";

// Registration functions remain unchanged
export const startTOTPRegistration: StartTOTPRegistrationFunction = async (
  userId: string,
  pat: string
) => {
  // Implementation should be in actions/mfa
  throw new Error("Not implemented");
};

export const verifyTOTPRegistration: VerifyTOTPRegistrationFunction = async (
  userId: string,
  sessionToken: string,
  code: string
) => {
  // Implementation should be in actions/mfa
  throw new Error("Not implemented");
};

export const checkTOTP: CheckTOTP = async (
  sessionId: string,
  sessionToken: string,
  code: string
) => {
  // Implementation should be in actions/mfa
  throw new Error("Not implemented");
};

export const TOTPSetupComponent: React.FC<TOTPSetupComponentProps> = ({
  uri,
  secret,
  onVerify,
}) => {
  const [verificationCode, setVerificationCode] = useState<string>("");

  const handleVerify = async (): Promise<void> => {
    await onVerify(verificationCode);
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900">
            Set up Two-Factor Authentication
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Scan this QR code with your authenticator app:
          </p>
          <div className="flex justify-center">
            <QRCodeCanvas value={uri} size={256} />
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Or enter this secret manually:{" "}
            <span className="font-mono font-bold">{secret}</span>
          </p>
        </div>

        <div className="space-y-3">
          <Input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setVerificationCode(e.target.value)
            }
            className="w-full px-1"
            placeholder="Enter 6-digit verification code"
          />
        </div>

        <Button onClick={handleVerify} className="w-full px-1">
          Verify
        </Button>
      </div>
    </div>
  );
};
