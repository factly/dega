import React, { useEffect, useState } from "react";
import Lock from "@/assets/lock.png";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define props interface for UnauthorizedOverlay
interface UnauthorizedOverlayProps {
  onClose?: () => void;
  isOpen?: boolean;
  customMessage?: string;
}

const UnauthorizedOverlay: React.FC<UnauthorizedOverlayProps> = ({
  onClose = () => {},
  isOpen = true,
  customMessage,
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  // Update visibility when isOpen prop changes
  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    if (isVisible) {
      document.body.classList.add("modal-open");
    }

    // Clean up function
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isVisible]);

  // Handler for closing the overlay
  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  // Don't render anything if not visible
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      <div className="fixed inset-0 bg-transparent pointer-events-none" />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 text-center p-10 rounded-lg -mt-40 bg-white/80 shadow-lg max-w-md w-full mx-auto">
        {/* Close button */}
        <Button
          onClick={handleClose}
          variant="outline"
          size="sm"
          className="absolute top-3 right-3 h-8 w-8 p-0"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </Button>

        <div className="rounded-full overflow-hidden w-24 h-24 bg-gray-100 flex items-center justify-center">
          <img src={Lock} width={96} height={96} alt="Lock" />
        </div>

        <h2 className="text-3xl font-semibold text-gray-800">
          Unauthorized Access
        </h2>

        {/* Subheading */}
        <p className="text-lg text-gray-600 px-6">
          {customMessage || "Please contact your administrator for access"}
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedOverlay;
