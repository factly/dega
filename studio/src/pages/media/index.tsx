import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { getMedia } from "../../actions/media";
import Loader from "../../components/Loader";
import { Helmet } from "react-helmet";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import { useMediaData } from "./hooks/useMediaData";
import { MediaFilters } from "./types";
import SecuredButton from "@/components/SecuredButton";
import MediumList from "./components/MediumList";

function Media(): React.ReactElement {
  const dispatch = useAppDispatch();
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

      {/* Header */}
      {isMobile ? (
        <div className="space-y-4 flex justify-between items-center">
          <div className="flex flex-col">
            {isMobile && <h1 className="text-xl font-semibold">Media</h1>}
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 ml-2">
              <SecuredButton
                className="h-9 w-9"
                size="icon"
                onClick={handleCreateMedia}
              >
                <PlusCircle className="h-5 w-5" />
              </SecuredButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-xl font-semibold">Media</h1>
          </div>
          <SecuredButton
            className="flex items-center gap-2 py-2"
            size="lg"
            onClick={handleCreateMedia}
          >
            <PlusCircle className="h-4 w-4" />
            Create Media
          </SecuredButton>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-scroll">
        <MediumList
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
