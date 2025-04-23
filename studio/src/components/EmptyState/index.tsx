import React, { ReactNode } from "react";
import { FolderOpen, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Map of content types to their respective icons
const CONTENT_ICONS = {
  default: FolderOpen,
};

export type ContentType = keyof typeof CONTENT_ICONS | string;

interface EmptyStateProps {
  contentType?: ContentType;
  title?: string;
  description?: string;
  actionText?: string;
  actionLink?: string;
  isMobile?: boolean;
  customIcon?: ReactNode;
  onActionClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  contentType = "default",
  title,
  description,
  actionText,
  actionLink,
  isMobile = false,
  customIcon,
  onActionClick,
}) => {
  // Default texts based on content type
  const defaultTitle = `No ${contentType} found`;
  const defaultDescription = `Create your first ${contentType
    .replace(/ies$/, "y")
    .replace(/s$/, "")} to get started`;
  const defaultActionText = `Create ${contentType
    .replace(/ies$/, "y")
    .replace(/s$/, "")}`;

  // Get the icon component based on content type
  const IconComponent =
    CONTENT_ICONS[contentType as keyof typeof CONTENT_ICONS] ||
    CONTENT_ICONS.default;

  // Button handler - only rendered if actionLink or onActionClick is provided
  const renderAction = () => {
    if (onActionClick) {
      return (
        <Button
          size={isMobile ? "default" : "lg"}
          className="flex items-center gap-2"
          onClick={onActionClick}
        >
          <PlusCircle className="h-4 w-4" />
          {actionText || defaultActionText}
        </Button>
      );
    } else if (actionLink) {
      return (
        <Link to={actionLink}>
          <Button
            size={isMobile ? "default" : "lg"}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            {actionText || defaultActionText}
          </Button>
        </Link>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center py-48 px-4">
      <div className="w-16 h-16 mb-4">
        {customIcon || (
          <IconComponent className="w-full h-full text-gray-400" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-gray-600 text-center mb-6">
        {description || defaultDescription}
      </p>
      {(actionLink || onActionClick) && renderAction()}
    </div>
  );
};

export default EmptyState;
