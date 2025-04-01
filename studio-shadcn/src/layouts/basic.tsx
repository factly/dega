import { FC, useEffect, ReactNode, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
// import {Sidebar} from "@/components/GlobalNav/Sidebar";
import Sidebar from "./app-sidebar"
import { SidebarAlt } from "@/components/GlobalNav/SidebarAlt";
import { RootState } from "@/types";
import { getSpaces } from "@/actions/spaces";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { routes, Route } from "@/config/routesConfig";
import _ from "lodash";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import degaLogoLetters from '@/assets/dega.png'

interface BasicLayoutProps {
  children?: ReactNode;
  formats?: any;
  setReloadFlag?: React.Dispatch<React.SetStateAction<boolean>>;
  reloadFlag?: boolean;
}

export const BasicLayout: FC<BasicLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const isMobile = useIsMobile();
  const isCollapsed = useSelector(
    (state: RootState) => state.sidebar.collapsed
  );
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [enteredRoute, setRoute] = useState<Route | undefined>({
    path: "/",
    title: "Home",
    menuKey: "/",
  });

  // Add a ref to track if spaces have been fetched
  const hasAttemptedSpacesFetch = useRef(false);

  // Get session and spaces state from Redux
  const session = useSelector((state: RootState) => state.session);
  const spaces = useSelector((state: RootState) => state.spaces);
  const { selected, loading, orgs } = spaces;

  // Get notification data from Redux
  const notification = useSelector((state: RootState) => state.notifications);

  // Paths where sidebar should be hidden
  const hiddenSidebarPaths = [
    "/auth/login",
    "/auth/registration",
    "/redirect",
    "/callback",
  ];

  // Public paths that should render children regardless of loading state
  const publicPaths = [
    "/auth/login",
    "/auth/registration",
    "/auth/login/recovery",
    "/auth/login/google",
    "/redirect",
    "/auth/verify",
  ];

  // Get space details and permissions for current space
  const spaceDetails = useSelector((state: RootState) => {
    if (selected !== "") {
      const space = state.spaces.details[selected];
      const applications =
        orgs.find((org) => org.spaces.includes(space?.id))?.applications || [];

      return {
        applications,
        permission: space?.permissions || [],
        services: space?.services || ["core"],
        org_role: space?.org_role,
      };
    }

    return {
      applications: [],
      permission: [],
      services: ["core"],
      org_role: state.spaces.org_role,
    };
  });

  // Track current route for menu highlighting
  useEffect(() => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    if (pathSnippets.length === 0) {
      setRoute({ path: "/", title: "Home", menuKey: "/" });
      return;
    }

    // Look for matching routes using same approach as basic.js
    for (let index = 0; index < pathSnippets.length; index++) {
      const url = `/${pathSnippets.slice(0, index + 1).join("/")}`;
      const nextTempRoute =
        pathSnippets.length - index > 1
          ? _.find(routes, {
            path: `/${pathSnippets.slice(0, index + 2).join("/")}`,
          })
          : null;
      const tempRoute = _.find(routes, { path: url });

      if (nextTempRoute) {
        continue;
      }

      if (tempRoute) {
        setRoute(tempRoute);
        break;
      }
    }
  }, [location]);

  // Check screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 460);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Only fetch spaces when the session is loaded and we haven't tried fetching yet
    if (
      session.details &&
      !session.loading &&
      Object.keys(session.details).length > 0 &&
      !hasAttemptedSpacesFetch.current &&
      !loading
    ) {
      hasAttemptedSpacesFetch.current = true;
      dispatch(getSpaces());
    }
  }, [dispatch, session.details, session.loading, loading]);

  // Check if current path should hide sidebar
  const shouldHideSidebar = hiddenSidebarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  // Check if current path is settings path to show the alternate sidebar
  const isSettingsPath = location.pathname.startsWith("/settings");

  // Check if sidebar should be hidden for specific content pages (edit/create)
  const hideSidebar =
    (location.pathname.includes("posts") ||
      location.pathname.includes("fact-checks") ||
      location.pathname.includes("pages")) &&
    (location.pathname.includes("edit") ||
      location.pathname.includes("create"));

  const isPublicPath = publicPaths.some((path) =>
    location.pathname.startsWith(path)
  );
  const shouldRenderContent = isPublicPath || (!session.loading && !loading);

  return (
    <SidebarProvider>
      {!shouldHideSidebar && (
        <>{isSettingsPath ? <SidebarAlt /> : <Sidebar />}</>
      )}
      <SidebarInset>
        {isMobile && (<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <img
            src={degaLogoLetters}
            alt="Dega"
            className="h-8 cursor-pointer mx-auto"
          />
        </header>)}
        <main className="p-6">
          {shouldRenderContent ? (
            children
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
    // // <div className="flex min-h-screen bg-background">
    // //   {!shouldHideSidebar && !hideSidebar && (
    // //     <>
    // //       {isSettingsPath ? (
    // //         <SidebarAlt
    // //           permission={spaceDetails.permission}
    // //           menuKey={enteredRoute?.menuKey}
    // //           orgs={orgs}
    // //           loading={loading}
    // //           applications={spaceDetails.applications}
    // //           services={spaceDetails.services}
    // //           org_role={spaceDetails.org_role}
    // //           isMobile={isMobileScreen}
    // //         />
    // //       ) : (
    // //         <Sidebar
    // //           permission={spaceDetails.permission}
    // //           menuKey={enteredRoute?.menuKey}
    // //           orgs={orgs}
    // //           loading={loading}
    // //           applications={spaceDetails.applications}
    // //           services={spaceDetails.services}
    // //           org_role={spaceDetails.org_role}
    // //           isMobile={isMobileScreen}
    // //         />
    // //       )}
    // //     </>
    // //   )}
    // //   <div
    // //     className={`flex-1 transition-all duration-300 ${
    // //       !shouldHideSidebar && !hideSidebar
    // //         ? isCollapsed
    // //           ? "ml-[89px]"
    // //           : "ml-[265px]"
    // //         : ""
    // //     } ${isMobileScreen ? "ml-0" : ""}`}
    // //   >
    // //     <main className="p-6">
    // //       {shouldRenderContent ? (
    // //         children
    // //       ) : (
    // //         <div className="flex items-center justify-center p-8">
    // //           <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
    // //         </div>
    // //       )}
    // //     </main>
    // //   </div>
    // // </div>
  );
};
