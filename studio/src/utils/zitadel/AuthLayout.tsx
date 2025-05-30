import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import useWindowSize from "../../hooks/use-mobile";

interface AuthLayoutProps {
  children: React.ReactNode;
  error?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  logoSrc: string;
  hideHeader?: boolean;
  title?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showBackButton = false,
  onBackClick,
  logoSrc,
  title,
}) => {
  const { isMobileScreen } = useWindowSize();

  return (
    <div className="fixed inset-0 flex w-screen h-screen overflow-hidden">
      {isMobileScreen ? (
        // Mobile Layout
        <div className="w-full flex flex-col">
          {" "}
          <div className="w-full bg-[#DCEFEB] flex justify-center items-center py-5">
            <div className="w-full max-w-[300px] relative">
              <img
                src={logoSrc}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          {/* Mobile content area */}
          <div className="flex-1 bg-white px-6 overflow-y-auto">
            <div className="w-full max-w-md mx-auto pt-6">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBackClick}
                  className="mb-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
              {children}
            </div>
          </div>
        </div>
      ) : (
        // Desktop Layout
        <>
          {/* Left side with logo */}
          <div className="w-[940px] bg-[#DCEFEB] flex items-center justify-center">
            <div className="w-full max-w-2xl px-4 flex items-center justify-center">
              <img
                src={logoSrc}
                alt="Logo"
                className="w-[300px] object-contain"
              />
            </div>
          </div>

          {/* Right side with form */}
          <div className="flex-1 h-full bg-white flex items-center justify-center">
            <div className="w-full max-w-md px-10">
              {showBackButton && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onBackClick}
                  className="mb-4"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthLayout;
