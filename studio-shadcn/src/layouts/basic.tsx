import { FC } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/GlobalNav/Sidebar";
import AuthWrapper from "@/components/AuthWrapper";

interface BasicLayoutProps {
  children?: React.ReactNode;
}

export const BasicLayout: FC<BasicLayoutProps> = () => {
  const location = useLocation();

  // Paths where sidebar should be hidden
  const hiddenSidebarPaths = [
    "/auth/login",
    "/auth/registration",
    "/redirect",
    "/callback",
  ];

  // Check if current path should hide sidebar
  const shouldHideSidebar = hiddenSidebarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <AuthWrapper>
      <div className="flex min-h-screen bg-background">
        {!shouldHideSidebar && <Sidebar />}
        <div className={`flex-1 ${!shouldHideSidebar ? "ml-64" : ""}`}>
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default BasicLayout;
