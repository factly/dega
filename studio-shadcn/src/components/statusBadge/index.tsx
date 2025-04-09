import { AlertCircle, CheckCircle, Clock, Calendar } from "lucide-react";

export const statusItems = [
  { value: "publish", label: "ACTIVE", icon: CheckCircle, color: "green" },
  { value: "future", label: "FUTURE", icon: Calendar, color: "blue" },
  { value: "ready", label: "READY", icon: Clock, color: "amber" },
  { value: "draft", label: "DRAFT", icon: AlertCircle, color: "gray" },
];

export const tabsItems = [
  { value: "all", label: "All" },
  { value: "publish", label: "Published" },
  { value: "future", label: "Future Publish" },
  { value: "ready", label: "Ready to Publish" },
  { value: "draft", label: "Drafts" },
];

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
    return (
      <div className="inline-flex items-center justify-center h-8 px-4 py-2 text-sm font-medium rounded-full border border-gray-300">
        {status || "Unknown"}
      </div>
    );
  }

  const Icon = statusItem.icon;

  // Consistent badge styling based on status
  let badgeClass =
    "inline-flex items-center justify-center h-8 px-4 py-2 text-sm font-medium rounded-full ";

  switch (statusItem.value) {
    case "publish":
      badgeClass += "bg-white text-green-600 border border-green-500";
      break;
    case "future":
      badgeClass += "bg-white text-blue-600 border border-blue-500";
      break;
    case "ready":
      badgeClass += "bg-white text-amber-600 border border-amber-500";
      break;
    case "draft":
      badgeClass += "bg-white text-gray-600 border border-gray-500";
      break;
    default:
      badgeClass += "bg-white text-gray-700 border border-gray-300";
  }

  return <div className={badgeClass}>{statusItem.label}</div>;
};
