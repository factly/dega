// Define analytics types
export interface AnalyticsPlausible {
  server_url?: string;
  domain?: string;
  embed_code?: string;
}

export interface Analytics {
  plausible: AnalyticsPlausible;
}

// Define space types
export interface Space {
  id: string;
  name: string;
  slug: string;
  organisation_id: string;
  analytics?: Analytics;
  [key: string]: any;
}

// Define Redux state types
export interface RootState {
  spaces: {
    selected: string;
    details: Record<string, Space>;
    loading: boolean;
  };
}
