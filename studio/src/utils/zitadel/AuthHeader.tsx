import React from "react";

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = "Hey there!",
  subtitle = "Let's get started by using your Email",
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold mb-2 text-[#1D1D1D]">{title}</h1>
      <p className="text-[#666666] font-normal">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
