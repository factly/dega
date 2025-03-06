import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { Loader, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Define types for our state and props
interface Space {
  analytics?: {
    plausible?: {
      embed_code?: string;
    };
  };
}

interface SpacesState {
  details: Record<string, Space>;
  selected: string;
  loading: boolean;
}

interface RootState {
  spaces: SpacesState;
}

function Analytics(): React.ReactElement {
  const { space, loading } = useSelector(({ spaces }: RootState) => {
    return {
      space: spaces.details[spaces.selected],
      loading: spaces.loading,
    };
  });

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!space) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto my-8">
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
    <div className="space-y-4">
      <Helmet title={"Analytics"} />
      {space.analytics?.plausible?.embed_code ? (
        <div
          dangerouslySetInnerHTML={{
            __html: space.analytics.plausible.embed_code,
          }}
        />
      ) : (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No analytics found</h3>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Analytics;
