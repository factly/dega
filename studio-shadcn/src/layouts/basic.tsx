import { FC } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/GlobalNav/Sidebar";

interface BasicLayoutProps {
  children?: React.ReactNode;
}

export const BasicLayout: FC<BasicLayoutProps> = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 ml-64">
          <main className="p-8">
            <Outlet />
          </main>
      </div>
    </div>
  );
};

export default BasicLayout;
