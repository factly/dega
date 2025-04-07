import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface MobileBreadcrumbProps {
  currentPage: string;
  parentLabel?: string;
}

const MobileBreadcrumb: React.FC<MobileBreadcrumbProps> = ({
  currentPage,
  parentLabel,
}) => {
  // If parentLabel is provided, use it directly
  const parentText = parentLabel || "Home";

  return (
    <div className="pt-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{parentText}</BreadcrumbPage>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default MobileBreadcrumb;
