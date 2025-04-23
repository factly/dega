import React from "react";

// Dashboard types
export interface RootState {
  spaces: {
    selected: string;
    loading: boolean;
  };
  info: {
    article: {
      publish?: string | number;
      draft?: string | number;
      ready?: string | number;
      future?: string | number;
    };
    factCheck: {
      publish?: string | number;
      draft?: string | number;
      ready?: string | number;
      future?: string | number;
    };
    loading: boolean;
  };
  sidebar: {
    collapsed: boolean;
  };
  ratings: {
    details: Record<string, any>;
    loading: boolean;
  };
  formats: {
    details: Record<string, any>;
    loading: boolean;
  };
  policies: {
    details: Record<string, any>;
    loading: boolean;
  };
  events: {
    details: Record<string, any>;
    loading: boolean;
  };
}

// StatisticCard types
export interface StatisticCardProps {
  title: string;
  value: number;
  loading: boolean;
  icon?: React.ReactNode;
  href: string;
  isMobile: boolean;
}
