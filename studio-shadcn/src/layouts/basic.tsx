import { FC } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Sidebar } from "@/components/GlobalNav/Sidebar";
import { SidebarAlt } from "@/components/GlobalNav/SidebarAlt";
import AuthWrapper from "@/components/AuthWrapper";
import { RootState } from "@/types";
// import { getSpaces } from "@/actions/spaces";
// import { useAppDispatch } from "@/hooks/reduxHooks";
interface BasicLayoutProps {
  children?: React.ReactNode;
}

export const BasicLayout: FC<BasicLayoutProps> = () => {
  // const dispatch = useAppDispatch();
  const location = useLocation();
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );

  // Get session state from Redux
  // const session = useSelector((state: RootState) => state.session);
  // const selected = useSelector((state: RootState) => state.spaces.selected);

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

  // Check if current path is settings path to show the alternate sidebar
  const isSettingsPath = location.pathname.startsWith("/settings");

  // // Added effect to fetch spaces when session is loaded
  // useEffect(() => {
  //   if (session.details && !session.loading && Object.keys(session.details).length > 0) {
  //     dispatch(getSpaces());
  //   }
  // }, [dispatch, selected, session]);

  return (
    <AuthWrapper>
      <div className="flex min-h-screen bg-background">
        {!shouldHideSidebar && (
          <>{isSettingsPath ? <SidebarAlt /> : <Sidebar />}</>
        )}
        <div
          className={`flex-1 transition-all duration-300 ${
            !shouldHideSidebar ? (isCollapsed ? "ml-[89px]" : "ml-[265px]") : ""
          }`}
        >
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default BasicLayout;
