// types.ts

// Category entity interface
export interface Category {
  id: string | number;
  name: string;
  slug: string;
  parent_id?: string | number;
  parent_category?: {
    id: string | number;
    name: string;
  };
  is_featured?: boolean;
  background_colour?: any;
  medium_id?: string | number;
  meta_fields?: string | Record<string, any>;
  [key: string]: any;
}

// Form values interface
export interface CategoryFormValues {
  id?: string | number;
  name: string;
  slug: string;
  parent_id?: string | number;
  is_featured?: boolean;
  description_html?: string;
  background_colour?: any;
  medium_id?: string | number;
  meta_fields?: string | Record<string, any>;
  meta?: {
    canonical_URL?: string;
    facebook?: {
      title?: string;
      canonical_URL?: string;
    };
    twitter?: {
      title?: string;
      canonical_URL?: string;
    };
    google?: {
      title?: string;
      canonical_URL?: string;
    };
  };
}

// Component props interfaces
export interface CategoryFormProps {
  onCreate: (values: CategoryFormValues) => void;
  data?: Partial<CategoryFormValues>;
}

export interface CategoryFilters {
  page: number;
  limit: number;
  sort: string;
  q?: string;
  [key: string]: any;
}

export interface FormValues {
  q?: string;
  sort?: string;
  [key: string]: any;
}

export interface CategoryListData {
  categories: Category[];
  total: number;
  loading: boolean;
}

export interface CategoryListProps {
  data: CategoryListData;
  filters: {
    page?: number;
    limit?: number;
  };
  fetchCategories: () => void;
  onPagination?: (page: number, limit: number) => void;
  sortOrder?: "asc" | "desc";
  onSortToggle?: () => void;
  isMobile?: boolean;
}

export interface FiltersPopoverProps {
  form: any;
  onSave: (values: FormValues) => void;
  hasActiveFilters: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}
