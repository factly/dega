// types.ts
// Tag entity interface
export interface Tag {
  id: string | number;
  name: string;
  slug: string;
  is_featured?: boolean;
  background_colour?: any;
  description_html?: string;
  medium_id?: string | number;
	description: {
    json: any;
    html: string;
  } | string;
  meta_fields?: string | Record<string, any>;
  [key: string]: any;
}

// Form values interface
export interface TagFormValues {
  id?: string | number;
  name: string;
  slug: string;
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
export interface TagFormProps {
  onCreate: (values: TagFormValues) => void;
  data?: Partial<TagFormValues>;
}

export interface TagFilters {
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

export interface TagListData {
  tags: Tag[];
  total: number;
  loading: boolean;
}

export interface TagListProps {
  data: TagListData;
  filters: {
    page?: number;
    limit?: number;
  };
  fetchTags: () => void;
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
