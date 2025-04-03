// utils/statusBadge.tsx
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Calendar } from "lucide-react";

// Define consistent status items for the entire application
export const statusItems = [
  { value: "publish", label: "Published", icon: CheckCircle, color: "green" },
  { value: "future", label: "Future Publish", icon: Calendar, color: "blue" },
  { value: "ready", label: "Ready to Publish", icon: Clock, color: "yellow" },
  { value: "draft", label: "Draft", icon: AlertCircle, color: "gray" },
];

// Dropdown/Select status items with "All" option included
export const pageStatusItems = [{ value: "all", label: "All" }, ...statusItems];

// Consistent status badge renderer for use across components
export const renderStatusBadge = (status: string | undefined) => {
  // If status is undefined, log it and default to draft
  if (status === undefined || status === null) {
    console.warn("Undefined status found, defaulting to 'draft'");
    status = "draft";
  }

  // Find the matching status item
  const statusItem = statusItems.find(
    (item) => item.value === status.toLowerCase()
  );

  if (!statusItem) {
    return <Badge variant="outline">{status || "Unknown"}</Badge>;
  }

  const Icon = statusItem.icon;

  // Consistent badge styling based on status
  let badgeClass = "";
  switch (statusItem.value) {
    case "publish":
      badgeClass = "bg-green-50 text-green-700 border-green-200";
      break;
    case "future":
      badgeClass = "bg-blue-50 text-blue-700 border-blue-200";
      break;
    case "ready":
      badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
      break;
    case "draft":
      badgeClass = "bg-gray-50 text-gray-700 border-gray-200";
      break;
    default:
      badgeClass = "";
  }

  return (
    <Badge variant="outline" className={badgeClass}>
      <Icon className="h-3 w-3 mr-1" /> {statusItem.label}
    </Badge>
  );
};
