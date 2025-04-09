import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../types";
import { Toaster, toast } from "sonner";

export const Notifications: React.FC = () => {
  const notification = useSelector((state: RootState) => state.notifications);

  useEffect(() => {
    if (notification.message) {
      // Show toast notification based on type
      if (notification.type === "error") {
        toast.error(notification.message, {
          description: notification.description || undefined,
          position: "top-right",
        });
      } else if (notification.type === "success") {
        toast.success(notification.message, {
          description: notification.description || undefined,
          position: "top-right",
        });
      }
    }
  }, [notification.time]); // Use time as dependency to trigger on each new notification

  return <Toaster />;
};
