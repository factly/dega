// index.tsx
import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { getMedia } from "../../actions/media";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import { useMediaData } from "./hooks/useMediaData";
import { MediaFilters } from "./types";
import SecuredButton from "@/components/SecuredButton";
import MediumList from "./components/MediumList";

interface PermissionProps {
  permission?: {
    actions: string[];
  };
}

function Media({ permission = { actions: [] } }: PermissionProps): React.ReactElement {
  const { actions } = permission;
  const dispatch = useAppDispatch();
  const { state: sidebarState } = useSidebar();
  const isMobile = useIsMobile();

  const [filters, setFilters] = useState<MediaFilters>({
    sort: "desc",
  });

  // Fetch data on initial load
  useEffect(() => {
    dispatch(getMedia(filters));
  }, [dispatch, filters]);

  // Use custom hook for data
  const { media, total, loading } = useMediaData(filters);

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
    <div className="flex flex-col h-full gap-6">
      <Helmet title="Media" />

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

      {/* Content */}
      <div className="flex-1 overflow-scroll">
        <MediumList
          actions={actions}
          data={{
            media,
            total,
            loading,
          }}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}

export default Media;
