// types.ts for Claims
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
  id: number;
  claim: string;
  claimant: string;
  claimant_id: number;
  rating: string;
  rating_id: number;
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
  sortOrder: "asc" | "desc";
  onSortToggle: () => void;
  sortBy: string;
  onSortByChange: (column: string) => void;
}

export interface FiltersPopoverProps {
  form: any;
  onSave: (values: FormValues) => void;
  hasActiveFilters: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}
