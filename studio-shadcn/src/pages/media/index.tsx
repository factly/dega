/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useSelector } from "react-redux";
import MediumList from "./components/MediumList";
import { getMedia } from "../../actions/media";
import { Link, useLocation } from "react-router-dom";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import SecuredButton from "@/components/SecuredButton";

// Define types
interface MediaItem {
  id: string;
  [key: string]: any;
}

interface MediaState {
  details: Record<string, MediaItem>;
  loading: boolean;
  req: Array<{
    query: Record<string, any>;
    data: string[];
    total: number;
  }>;
}

interface RootState {
  media: MediaState;
  sidebar: {
    collapsed: boolean;
  };
}

interface PermissionProps {
  permission?: {
    actions: string[];
  };
}

function Media({ permission = { actions: [] } }: PermissionProps): JSX.Element {
  const { actions } = permission;
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  const params = {
    sort: "desc",
  };

  // Get media data from Redux state
  const { media, total, loading } = useSelector((state: RootState) => {
    const node = state.media.req.find((item) => {
      return item.query.sort === params.sort;
    });

    if (node) {
      // Map IDs to actual media objects from details
      return {
        media: node.data
          .map((id) => state.media.details[id])
          // Filter out undefined or null values
          .filter(Boolean),
        total: node.total,
        loading: state.media.loading,
      };
    }

    // Return empty data if no cache node found
    return {
      media: [],
      total: 0,
      loading: state.media.loading,
    };
  });

  // Fetch data on initial load with simplified params
  useEffect(() => {
    dispatch(getMedia(params));
  }, [dispatch]);

  const isCollapsed = sidebarState === "collapsed" && !isMobile;

  // Handle navigation to create media page
  const handleCreateMedia = () => {
    window.location.href = "/media/upload";
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full relative">
        <Helmet title={"Media"} />
        {isMobile && (
          <MobileBreadcrumb currentPage="Media" parentLabel="Core" />
        )}
        <div className="flex-1 flex items-center justify-center">
          <Loader className="relative inset-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Helmet title={"Media"} />

      {/* Mobile Breadcrumb */}
      {isMobile && <MobileBreadcrumb currentPage="Media" parentLabel="Core" />}

      <div
        className={`${isMobile ? "sticky top-0" : "fixed"} z-10 bg-white`}
        style={
          !isMobile
            ? {
                left: isCollapsed ? "89px" : "265px",
                right: 0,
                transition: "left 0.3s ease",
              }
            : undefined
        }
      >
        <div
          className={`flex justify-between items-center ${
            isMobile ? "pb-3 pt-1" : "px-6 pt-1 h-full"
          }`}
        >
          {/* Title */}
          <h1 className="text-xl font-semibold">Media</h1>

          {/* Action buttons */}
          <div className={`${isMobile ? "flex items-center gap-2" : ""}`}>
            {isMobile ? (
              <SecuredButton
                className="h-9 w-9"
                size="icon"
                onClick={handleCreateMedia}
              >
                <PlusCircle className="h-5 w-5" />
              </SecuredButton>
            ) : (
              <SecuredButton
                className="flex items-center gap-2 py-2"
                size="lg"
                onClick={handleCreateMedia}
              >
                <PlusCircle className="h-4 w-4" />
                Create Media
              </SecuredButton>
            )}
          </div>
        </div>
      </div>

      <div
        className={
          isMobile
            ? "flex-1 pb-16 pt-1 overflow-auto px-4"
            : "absolute overflow-auto"
        }
        style={
          !isMobile
            ? {
                top: "calc(1.5rem + 2.5rem + 1rem)",
                left: 0,
                right: 0,
                bottom: "64px",
                paddingLeft: "1.5rem",
                paddingRight: "1.5rem",
                paddingBottom: "1.5rem",
                paddingTop: "1rem",
                transition: "left 0.3s ease, top 0.3s ease",
              }
            : undefined
        }
      >
        <MediumList
          actions={actions}
          data={{ media: media || [], total: total || 0, loading: loading }}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

export default Media;
