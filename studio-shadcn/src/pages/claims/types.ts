// Source and claim related interfaces
export interface ClaimSource {
  url: string;
  description: string;
}

export interface ReviewSource {
  url: string;
  description: string;
}

// Form values interface
export interface ClaimFormValues {
  id?: number | string;
  claim: string;
  slug: string;
  fact?: string;
  claimant: number;
  claimant_id?: number;
  rating: number;
  rating_id?: number;
  claim_date?: Date | null;
  checked_date?: Date | null;
  description_html?: string;
  claim_sources?: ClaimSource[];
  review_sources?: ReviewSource[];
  meta_fields?: string;
}

// Formatted values interface with string dates
export interface FormattedClaimValues
  extends Omit<ClaimFormValues, "claim_date" | "checked_date"> {
  claim_date?: string | null;
  checked_date?: string | null;
}

// Component props interface
export interface ClaimFormProps {
  onCreate: (values: FormattedClaimValues) => void;
  data?: Partial<ClaimFormValues>;
}

export interface FormValues {
  q?: string;
  sort?: string;
  rating?: string[];
  claimant?: string[];
  sortBy?: string;
  [key: string]: any;
}

export interface ClaimFilters {
  page: number;
  limit: number;
  rating: string[];
  claimant: string[];
  sort: string;
  sortBy: string;
  [key: string]: any;
}

export interface Claim {
  id: string | number;
  claim: string;
  claimant: string;
  claimant_id: string | number;
  rating: string;
  rating_id: string | number;
  claim_date: string;
  [key: string]: any;
}

export interface ClaimListData {
  claims: Claim[];
  total: number;
  loading: boolean;
}

export interface ClaimListProps {
  data: ClaimListData;
  filters: {
    page: number;
    limit: number;
  };
  fetchClaims: () => void;
  onPagination: (page: number, limit: number) => void;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  sortBy?: string;
  onSortByChange?: (column: string) => void;
  isMobile?: boolean;
}

export interface FiltersPopoverProps {
  form: any;
  onSave: (values: FormValues) => void;
  hasActiveFilters: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}
