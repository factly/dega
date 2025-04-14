// Import color-related types
export interface ColorResult {
  hex: string;
  rgb?: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
  hsl?: {
    h: number;
    s: number;
    l: number;
    a?: number;
  };
}

// Rating related interfaces
export interface Rating {
  id: string;
  name: string;
  slug?: string;
  numeric_value: number;
  medium_id?: number;
  background_colour?: {
    hex: string;
  };
  text_colour?: {
    hex: string;
  };
  meta_fields?: string | Record<string, any>;
  [key: string]: any;
}

// Form values interface
export interface RatingFormValues {
  id?: string;
  name?: string;
  slug?: string;
  numeric_value?: number;
  medium_id?: number;
  background_colour?: {
    hex: string;
  };
  text_colour?: {
    hex: string;
  };
  meta_fields?: string | Record<string, any>;
}

// Component props interface
export interface RatingFormProps {
  onCreate: (values: Rating) => void;
  data?: Partial<RatingFormValues>;
}

export interface RatingListProps {
  data: {
    ratings: Rating[];
    loading: boolean;
    total: number;
  };
  filters: RatingFilters;
  setFilters: (
    filters: RatingFilters | ((prev: RatingFilters) => RatingFilters)
  ) => void;
  fetchRatings: () => void;
  actions?: string[];
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  isMobile?: boolean;
}

export interface RatingFilters {
  page: number;
  limit: number;
  [key: string]: any;
}

export interface RatingState {
  req: {
    query: Record<string, any>;
    data: string[];
    total: number;
  }[];
  details: Record<string, Rating>;
  loading: boolean;
}

export interface Permission {
  actions: string[];
}

export interface RootState {
  ratings: RatingState;
  sidebar: {
    collapsed: boolean;
  };
}
