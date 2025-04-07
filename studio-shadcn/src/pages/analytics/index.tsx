import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { Loader, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
      <div className="w-full h-48 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!space) {
    return (
      <Alert
        variant="destructive"
        className={`${isMobile ? "mx-4 my-4" : "max-w-md mx-auto my-8"}`}
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No space found</AlertTitle>
        <AlertDescription className="mt-2">
          <p>You need to create a space first.</p>
          <Button className="mt-4">
            <Link to="/spaces/create">Create Space</Link>
          </Button>
        </AlertDescription>
      </Alert>
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
