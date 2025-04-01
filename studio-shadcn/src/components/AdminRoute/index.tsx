import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { AlertTriangle, Home } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RootState } from "@/store/index";

interface AdminRouteProps {
  component: React.ComponentType<any>;
  formats?: any;
  [key: string]: any;
}

function AdminRoute({
  component: Component,
  formats,
  ...rest
}: AdminRouteProps): ReactElement {
  const { loading, org, isOwner } = useSelector((state: RootState) => {
    const orgs = state.spaces.orgs.filter((each) => each.role === "admin");

    return {
      loading: false,
      org: state.admin.organisation,
      isOwner: orgs.length > 0,
    };
  });

  if (loading) {
    return <></>;
  }

  if (!loading && !org) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            No Organization Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Sorry, you are not authorized to access this page. Please contact
              your organisation admin.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!loading && org.is_admin && isOwner) {
    return <Component {...rest} formats={formats} />;
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Error 403
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            Sorry, you are not authorized to access this page.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Link to="/">
          <Button variant="default" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Back Home
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

export default AdminRoute;
