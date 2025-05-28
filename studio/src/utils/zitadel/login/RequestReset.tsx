import React from "react";
import { Button } from "@/components/ui/button";

interface RequestResetProps {
  userEmail: string;
  onSubmit: () => void;
}

const RequestReset: React.FC<RequestResetProps> = ({ userEmail, onSubmit }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-700">
          A verification code will be sent to: <strong>{userEmail}</strong>
        </p>

        <Button type="submit" className="w-full">
          Send Verification Code
        </Button>
      </form>
    </div>
  );
};

export default RequestReset;
