import { Sidebar } from "../components/GlobalNav/Sidebar";
import { Outlet } from "react-router-dom";

export function BasicLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
