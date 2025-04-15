import { FC, useEffect, ReactNode, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./app-sidebar";
import { SidebarAlt } from "@/components/GlobalNav/SidebarAlt";
import { RootState } from "@/types";
import { getSpaces } from "@/actions/spaces";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { routes, Route } from "@/config/routesConfig";
import _ from "lodash";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import degaLogoLetters from "@/assets/dega.png";
import { cn } from "@/lib/utils";
import Loader from "@/components/Loader";

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
  // Add local state to track if we've initiated a space fetch in this component instance
  const [hasInitiatedFetch, setHasInitiatedFetch] = useState(false);

  // Get session and spaces state from Redux
  const session = useSelector((state: RootState) => state.session);
  const spaces = useSelector((state: RootState) => state.spaces);
  const { selected, loading, orgs, hasAttemptedFetch } = spaces;

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

  useEffect(() => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    if (pathSnippets.length === 0) {
      setRoute({ path: "/", title: "Home", menuKey: "/" });
      return;
    }

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 460);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Modified space fetching logic to avoid infinite loading
  useEffect(() => {
    // If session is ready and we haven't initiated a fetch yet
    if (
      session.details &&
      Object.keys(session.details).length > 0 &&
      !hasInitiatedFetch
    ) {
      // Mark that we've initiated a fetch
      setHasInitiatedFetch(true);
      // Dispatch the action to get spaces
      dispatch(getSpaces());
    }
  }, [dispatch, session.details, hasInitiatedFetch]);

  const shouldHideSidebar = hiddenSidebarPaths.some((path) =>
    location.pathname.startsWith(path)
  );

  const isSettingsPath = location.pathname.startsWith("/settings");

  const hideSidebar =
    (location.pathname.includes("posts") ||
      location.pathname.includes("fact-checks") ||
      location.pathname.includes("pages")) &&
    (location.pathname.includes("edit") ||
      location.pathname.includes("create"));

  const isPublicPath = publicPaths.some((path) =>
    location.pathname.startsWith(path)
  );
  const shouldRenderContent =
    isPublicPath || hasAttemptedFetch || hasInitiatedFetch;

  // Add a timeout to handle cases where loading gets stuck
  useEffect(() => {
    // If loading persists for more than 5 seconds, force render the content
    const timeoutId = setTimeout(() => {
      if (!shouldRenderContent) {
        setHasInitiatedFetch(true);
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [shouldRenderContent]);

  return (
    <SidebarProvider>
      {!shouldHideSidebar && (
        <>{isSettingsPath ? <SidebarAlt /> : <Sidebar />}</>
      )}
      <SidebarInset>
        {isMobile && (
          <header className="flex h-16 w-screen shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <img
              src={degaLogoLetters}
              alt="Dega"
              className="h-8 cursor-pointer mx-auto"
            />
          </header>
        )}
        {shouldRenderContent ? (
          <div
            className={cn(
              isMobile ? "p-4 h-[calc(100vh-4rem)]" : "p-6 h-screen",
              isSettingsPath && !isMobile && "ml-[265px]"
            )}
          >
            {children}
          </div>
        ) : (
          <div className="flex flex-col h-full relative">
            <div className="flex-1 flex items-center justify-center">
              <Loader className="relative inset-auto" />
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
};
