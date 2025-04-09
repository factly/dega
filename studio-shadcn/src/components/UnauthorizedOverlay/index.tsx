import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import degaLogoLetters from "@/assets/dega.png";
import Lock from "@/assets/lock.png";

// Define props interface for UnauthorizedOverlay
interface UnauthorizedOverlayProps {
  onDismiss: () => void;
  customMessage?: string;
}

const UnauthorizedOverlay: React.FC<UnauthorizedOverlayProps> = ({
  onDismiss,
  customMessage,
}) => {
  const handleGoBack = () => {
    // Clear the error state
    onDismiss();
  };

  const handleRequestAccess = () => {
    window.open(
      "https://forms.gle/kyJzcsDjMY5mKSqt9",
      "_blank",
      "noopener,noreferrer"
    );
  };

  useEffect(() => {
    document.body.classList.add("modal-open");
    // Clean up function
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-transparent pointer-events-none" />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-6 text-center p-6 rounded-md -mt-40 bg-white/80 shadow-lg">
        <div className="w-32 h-19">
          <img src={degaLogoLetters} className="mx-auto mt-4" alt="Logo" />
        </div>

        <div className="rounded-full overflow-hidden w-20 h-20 bg-gray-100 flex items-center justify-center">
          <img src={Lock} width={80} height={80} alt="Lock" />
        </div>

        <h2 className="text-2xl font-semibold text-gray-800">
          Unauthorized Access
        </h2>
        <div className="space-y-2">
          {customMessage ? (
            <p className="text-neutral-900">{customMessage}</p>
          ) : (
            <>
              <p className="text-neutral-900">
                Currently we are only allowing early access to our platform.
              </p>
              <p className="text-neutral-900">
                If you want to get early access, please drop us a request.
              </p>
            </>
          )}
        </div>

        <div className="flex w-full gap-4 mt-4">
          <Button variant="outline" onClick={handleGoBack} className="w-1/2">
            Go back
          </Button>
          <Button onClick={handleRequestAccess} className="w-1/2">
            Request access
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedOverlay;
