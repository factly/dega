// Space related interfaces
export interface Space {
  id: string;
  name: string;
  site_address?: string;
  site_title?: string;
  tag_line?: string;
  description?: string;
  slug?: string;
  organisation_id: string;
  meta_fields?: string | Record<string, any>;
  org_role?: string;
  created_at?: string;
}

// Form values interface
export interface SpaceFormValues {
  organisation_id: string;
  name: string;
  slug: string;
  site_title?: string;
  site_address?: string;
  tag_line?: string;
  description?: string;
  meta_fields?: Record<string, any> | string;
}

// Organization interface
export interface Organization {
  id: string;
  title: string;
  role: string;
  spaces: string[];
}

// Component props interfaces
export interface SpaceCreateFormProps {
  onCreate: (values: SpaceFormValues) => void;
}

export interface SpaceEditFormProps {
  onCreate: (values: Partial<Space>) => void;
  data?: Partial<Space>;
}

export interface SpaceListProps {
  searchQuery?: string;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  filters?: {
    page: number;
    limit: number;
  };
  setFilters?: (filters: { page: number; limit: number }) => void;
  isMobile?: boolean;
}

// Define types for filters
export interface SpaceFilters {
  page: number;
  limit: number;
  [key: string]: any;
}

// State interfaces
export interface SpaceDetails {
  org_role?: string;
  [key: string]: any;
}

export interface SpacesState {
  selected: string;
  details: {
    [key: string]: Space;
  };
  orgs: Organization[];
  loading: boolean;
  total: number | null;
  hasAttemptedFetch: boolean;
}

export interface RootState {
  spaces: SpacesState;
  sidebar: {
    collapsed: boolean;
  };
}

export interface SpaceState {
  spaces: Space[];
  loading: boolean;
  total: number | null;
  hasAttemptedFetch: boolean;
}

export interface RoleState {
  role: string;
}

export type AppDispatch = any;
