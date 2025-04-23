import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticCardProps } from "../types";

// Component for displaying numeric statistics with an icon
const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  loading,
  icon,
  href,
  isMobile,
}) => {
  return (
    <Link to={href} className="block">
      <Card
        className={`hover:bg-muted/50 transition-colors h-full ${
          isMobile ? "p-1" : ""
        }`}
      >
        <CardHeader className={`${isMobile ? "p-3 pb-1" : "pb-2"}`}>
          <CardTitle
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } font-medium flex items-center gap-2`}
          >
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className={isMobile ? "p-3 pt-1" : undefined}>
          {loading ? (
            <div className="h-6 w-12 bg-muted animate-pulse rounded" />
          ) : (
            <span className={`${isMobile ? "text-lg" : "text-2xl"} font-bold`}>
              {value}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default StatisticCard;
