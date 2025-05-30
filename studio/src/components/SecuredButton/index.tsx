import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import UnauthorizedOverlay from "../UnauthorizedOverlay";
import { useSession } from "@/hooks/useSession";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

export interface SecuredButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  unauthorizedMessage?: string;
  asChild?: boolean;
}

const SecuredButton: React.FC<SecuredButtonProps> = ({
  children,
  unauthorizedMessage,
  variant,
  size,
  asChild,
  ...buttonProps
}) => {
  const { isAdmin } = useSession();
  const [showOverlay, setShowOverlay] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // If user is admin, allow the original onClick to run
    if (isAdmin) {
      if (typeof buttonProps.onClick === "function") {
        buttonProps.onClick(e);
      }
      return;
    }

    // Otherwise prevent default behavior and show the overlay
    e.preventDefault();
    e.stopPropagation();
    setShowOverlay(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        asChild={asChild}
        {...buttonProps}
        onClick={handleClick}
      >
        {children}
      </Button>

      {showOverlay && (
        <UnauthorizedOverlay
          onClose={() => setShowOverlay(false)}
          isOpen={showOverlay}
        />
      )}
    </>
  );
};

export default SecuredButton;
