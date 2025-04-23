// types.ts
export interface Format {
  id: number;
  slug: string;
  [key: string]: any;
  name: string;
}

export interface FormatState {
  loading: boolean;
  article?: Format;
  [key: string]: any;
}

export interface Space {
  [key: string]: any;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  status?: "publish" | "draft" | "ready" | "future";
  featured_medium_id?: number;
  medium?: any;
  published_date: string | null;
  categories?: number[];
  tags?: number[];
  authors?: number[];
  claims?: number[];
  description?: any;
  format?: number;
  [key: string]: any;
}

export interface Author {
  id: number;
  display_name: string;
  [key: string]: any;
}

export interface Category {
  id: number;
  name: string;
  [key: string]: any;
}

export interface Tag {
  id: number;
  name: string;
  [key: string]: any;
}

export interface PagesState {
  req: Array<{
    query: {
      [key: string]: any;
    };
    data: number[];
    total: number;
  }>;
  details: {
    [key: number]: Page;
  };
  loading: boolean;
}

export interface MediaState {
  details: {
    [key: number]: any;
  };
}

export interface TagsState {
  details: {
    [key: number]: Tag;
  };
}

export interface CategoriesState {
  details: {
    [key: number]: Category;
  };
}

export interface RootState {
  spaces: Space[];
  pages: PagesState;
  media: MediaState;
  tags: TagsState;
  categories: CategoriesState;
  sidebar: {
    collapsed: boolean;
  };
}

export interface FilterParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  tag?: string[];
  category?: string[];
  author?: string[];
  format?: string;
  sortBy?: string;
  [key: string]: any;
}

export interface PagesProps {
  formats: FormatState;
}

export interface SearchInputProps {
  searchText: string;
  setSearchText: (text: string) => void;
  handleSearchSubmit: () => void;
  clearSearch: () => void;
  isCollapsable?: boolean;
}

export interface FiltersPopoverProps {
  form: any;
  onSave: (values: FilterParams) => void;
}

export interface PaginationFooterProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedItems: number;
}

export interface PageData {
  pages: Page[];
  total: number;
  loading: boolean;
  tags: Record<number, Tag>;
  categories: Record<number, Category>;
}
