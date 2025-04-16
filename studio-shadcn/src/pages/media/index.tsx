// index.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import MediumList from "./components/MediumList";
import { getMedia } from "../../actions/media";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import { useMediaData } from "./hooks/useMediaData";
import { MediaFilters } from "./types";

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

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full gap-6">
      <Helmet title="Media" />

      {/* Header */}
      <div className="flex justify-between items-center">
        {isMobile && (
          <MobileBreadcrumb
            currentPage="Media"
            parentLabel="Core"
          />
        )}
        <h1 className="text-xl font-semibold">Media</h1>

        <Link to="/media/upload">
          {isMobile ? (
            <Button size="icon" className="h-9 w-9">
              <PlusCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button size="lg" className="flex items-center gap-2 py-2">
              <PlusCircle className="h-4 w-4" />
              <span>New Media</span>
            </Button>
          )}
        </Link>
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
