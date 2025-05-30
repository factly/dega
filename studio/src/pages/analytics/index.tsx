import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { Loader } from "lucide-react";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import MobileBreadcrumb from "@/components/MobileBreadcrumb";
import { useIsMobile } from "@/hooks/use-mobile";
import { RootState } from "./types";

function Analytics(): React.ReactElement {
  const { space, loading } = useSelector(({ spaces }: RootState) => {
    return {
      space: spaces.details[spaces.selected],
      loading: spaces.loading,
    };
  });

  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex flex-col h-full relative">
        <Helmet title={"Analytics"} />
        {isMobile && (
          <MobileBreadcrumb currentPage="Analytics" parentLabel="Home" />
        )}
        <div className="flex-1 flex items-center justify-center">
          <Loader className="relative inset-auto" />
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <RecordNotFound
        status="Info"
        title="No space found"
        entity="Space"
        link="/spaces/create"
      />
    );
  }

  return (
    <>
      <Helmet title={"Analytics"} />

      {/* Mobile Breadcrumb */}
      {isMobile && (
        <MobileBreadcrumb currentPage="Analytics" parentLabel="Dashboard" />
      )}

      <div className={`${isMobile ? "" : "p-6"}`}>
        <div
          className="container mx-auto"
          style={{
            maxWidth: isMobile ? "100%" : "1200px",
          }}
        >
          {isMobile && (
            <h1 className="text-xl font-semibold mb-4">Analytics</h1>
          )}

          <div className={`space-y-4 ${isMobile ? "px-4" : ""}`}>
            {space.analytics?.plausible?.embed_code ? (
              <div
                className={`${isMobile ? "overflow-x-auto" : ""}`}
                dangerouslySetInnerHTML={{
                  __html: space.analytics.plausible.embed_code,
                }}
              />
            ) : (
              <RecordNotFound
                status="Info"
                title="No analytics found for this space."
                entity="Analytics"
                link="/settings/website/analytics"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Analytics;
