import React from "react";
import getUserPermission from "../../utils/getUserPermission";
import { useSelector } from "react-redux";
import { RootState } from "../../store/index";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface PermissionProps {
  resource: string;
  action: string | string[];
  isSpace?: boolean;
}

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  permission?: PermissionProps;
  isAdmin?: boolean;
  isOwner?: boolean;
  formats?: any;
  setReloadFlag?: React.Dispatch<React.SetStateAction<boolean>>;
  reloadFlag?: boolean;
  [key: string]: any; // For other props passed through rest
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  permission,
  isAdmin = false,
  isOwner = false,
  formats,
  setReloadFlag,
  reloadFlag,
  ...rest
}) => {
  const spaces = useSelector((state: RootState) => state.spaces);
  const { loading, orgs, selected } = spaces;

  // If no permission needed, render the component
  if (!permission && !isAdmin) {
    return (
      <Component
        {...rest}
        formats={formats}
        setReloadFlag={setReloadFlag}
        reloadFlag={reloadFlag}
      />
    );
  }

  // If admin route, check if user is admin
  if (isAdmin) {
    const hasAdminPermission = orgs.some((org) => org.role === "admin");
    if (hasAdminPermission) {
      return (
        <Component
          {...rest}
          formats={formats}
          setReloadFlag={setReloadFlag}
          reloadFlag={reloadFlag}
        />
      );
    } else {
      return <UnauthorizedView />;
    }
  }

  // If we're still loading, return null
  if (loading) {
    return null;
  }

  // Check if user has any organizations
  if (!loading && orgs.length === 0) {
    return <NoOrganizationsView />;
  }

  // Handle isOwner case
  if (
    !loading &&
    isOwner &&
    selected === "" &&
    orgs.filter((each) => each.role === "admin").length > 0
  ) {
    return (
      <Component
        {...rest}
        permission={{ actions: [] }}
        formats={formats}
        setReloadFlag={setReloadFlag}
        reloadFlag={reloadFlag}
      />
    );
  }

  // Check for admin in selected space or in orgs
  if (
    !loading &&
    selected !== "" &&
    orgs.filter((each) => each.role === "admin").length > 0
  ) {
    return (
      <Component
        {...rest}
        permission={{ actions: [] }}
        formats={formats}
        setReloadFlag={setReloadFlag}
        reloadFlag={reloadFlag}
      />
    );
  }

  // Check for specific permissions if needed
  if (permission) {
    const actions = getUserPermission({
      resource: permission.resource,
      action: Array.isArray(permission.action)
        ? permission.action[0]
        : permission.action,
      spaces,
    });

    if (actions.length > 0) {
      return (
        <Component
          {...rest}
          permission={{ actions }}
          formats={formats}
          setReloadFlag={setReloadFlag}
          reloadFlag={reloadFlag}
        />
      );
    }
  }

  // If no conditions are met, user is unauthorized
  return <UnauthorizedView />;
};

const NoOrganizationsView = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <Alert variant="destructive" className="max-w-lg">
      <AlertTitle className="text-xl font-bold">No Organizations</AlertTitle>
      <AlertDescription>
        You do not have any organization. Please contact your administrator.
      </AlertDescription>
    </Alert>
  </div>
);

const UnauthorizedView = () => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <Alert variant="destructive" className="max-w-lg">
      <AlertTitle className="text-xl font-bold">Unauthorized</AlertTitle>
      <AlertDescription>
        Sorry, you are not authorized to access this page.
      </AlertDescription>
    </Alert>
    <Link to="/" className="mt-6">
      <Button variant="default">Back Home</Button>
    </Link>
  </div>
);

export default ProtectedRoute;
