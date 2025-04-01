import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface MobileBreadcrumbProps {
  currentPage: string;
  parentPath?: string;
  parentLabel?: string;
}

const MobileBreadcrumb: React.FC<MobileBreadcrumbProps> = ({
  currentPage,
  parentPath,
  parentLabel,
}) => {
  const location = useLocation();

  const getParentInfo = () => {
    if (parentPath && parentLabel) {
      return { path: parentPath, label: parentLabel };
    }

    const pathParts = location.pathname.split("/").filter(Boolean);

    if (pathParts.length > 1) {
      const parentPathPart = pathParts[0];
      // Capitalize first letter of the parent path for display
      const parentLabelText =
        parentPathPart.charAt(0).toUpperCase() + parentPathPart.slice(1);
      return { path: `/${parentPathPart}`, label: parentLabelText };
    }

    // Default to Core if no parent is found
    return { path: "/", label: "Core" };
  };

  const parent = getParentInfo();

  return (
    <div className="pt-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          {parent.path !== "/" && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={parent.path}>{parent.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}

          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default MobileBreadcrumb;
