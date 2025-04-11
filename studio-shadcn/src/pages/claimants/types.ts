// Claimant related interfaces
export interface Claimant {
  id: string;
  name: string;
  slug?: string;
  is_featured?: boolean;
  tag_line?: string;
  medium_id?: number;
  description_html?: string;
  meta_fields?: string;
  [key: string]: any;
}

// Form values interface
export interface ClaimantFormValues {
  id?: number | string;
  name?: string;
  slug?: string;
  is_featured?: boolean;
  tag_line?: string;
  medium_id?: number;
  description_html?: string;
  meta_fields?: string;
}

// Component props interface
export interface ClaimantFormProps {
  onCreate: (values: ClaimantFormValues) => void;
  data?: Partial<ClaimantFormValues>;
}

export interface ClaimantListProps {
  data: {
    claimants: Claimant[];
    loading: boolean;
    total: number;
  };
  filters: {
    page: number;
    limit: number;
    [key: string]: any;
  };
  setFilters: (filters: any) => void;
  fetchClaimants: () => void;
  actions?: string[];
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  isMobile?: boolean;
}

export interface ClaimantFilters {
  page: number;
  limit: number;
  [key: string]: any;
}

export interface ClaimantState {
  req: {
    query: Record<string, any>;
    data: string[];
    total: number;
  }[];
  details: Record<string, Claimant>;
  loading: boolean;
}

export interface RootState {
  claimants: ClaimantState;
  sidebar: {
    collapsed: boolean;
  };
}
